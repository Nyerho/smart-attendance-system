import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

/**
 * GET /api/attendance/export
 * Export attendance records as CSV
 * Query params: session_id, date_from, date_to, status, format (csv|json)
 */
export async function GET(request) {
  try {
    const authSession = await auth();
    if (!authSession?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins and teachers can export
    const userRows =
      await sql`SELECT role FROM auth_users WHERE id = ${authSession.user.id}`;
    const role = userRows[0]?.role;
    if (!["admin", "teacher", "manager"].includes(role)) {
      return Response.json(
        { error: "Forbidden. Only admins and teachers can export." },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");
    const dateFrom = searchParams.get("date_from");
    const dateTo = searchParams.get("date_to");
    const statusFilter = searchParams.get("status");
    const format = searchParams.get("format") || "csv";

    // Build dynamic query
    const conditions = ["1=1"];
    const values = [];

    if (sessionId) {
      values.push(sessionId);
      conditions.push(`ar.session_id = $${values.length}`);
    }
    if (statusFilter && statusFilter !== "all") {
      values.push(statusFilter);
      conditions.push(`ar.status = $${values.length}`);
    }
    if (dateFrom) {
      values.push(dateFrom);
      conditions.push(`ar.check_in_time >= $${values.length}`);
    }
    if (dateTo) {
      values.push(dateTo + " 23:59:59");
      conditions.push(`ar.check_in_time <= $${values.length}`);
    }

    const query = `
      SELECT 
        ar.id,
        ar.user_name AS "Student Name",
        ar.user_email AS "Email",
        ast.title AS "Session",
        TO_CHAR(ast.session_date, 'YYYY-MM-DD') AS "Date",
        TO_CHAR(ar.check_in_time, 'HH24:MI:SS') AS "Check-in Time",
        ar.status AS "Status",
        ar.method AS "Method",
        CASE WHEN ar.verified THEN 'Yes' ELSE 'No' END AS "Verified",
        ar.notes AS "Notes"
      FROM attendance_records ar
      LEFT JOIN attendance_sessions ast ON ar.session_id = ast.id
      WHERE ${conditions.join(" AND ")}
      ORDER BY ar.check_in_time DESC
      LIMIT 5000
    `;

    const records = await sql(query, values);

    if (format === "json") {
      return Response.json({ records, total: records.length });
    }

    // Build CSV
    if (records.length === 0) {
      const csv = "No records found\n";
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="attendance-export-${Date.now()}.csv"`,
        },
      });
    }

    const headers = Object.keys(records[0]).filter((k) => k !== "id");
    const csvRows = [
      headers.join(","),
      ...records.map((row) =>
        headers
          .map((h) => {
            const val = row[h] ?? "";
            // Escape commas and quotes
            const str = String(val).replace(/"/g, '""');
            return str.includes(",") || str.includes('"') || str.includes("\n")
              ? `"${str}"`
              : str;
          })
          .join(","),
      ),
    ];

    const csv = csvRows.join("\n");
    const filename = `smartattend-export-${new Date().toISOString().split("T")[0]}.csv`;

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("GET /api/attendance/export error:", err);
    return Response.json({ error: "Export failed" }, { status: 500 });
  }
}
