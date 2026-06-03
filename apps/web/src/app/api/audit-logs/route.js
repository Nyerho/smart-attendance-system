import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const authSession = await auth();
    if (!authSession?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRows =
      await sql`SELECT role FROM auth_users WHERE id = ${authSession.user.id}`;
    const role = userRows[0]?.role;
    if (!["admin", "manager"].includes(role)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const action = searchParams.get("action") || "";
    const offset = parseInt(searchParams.get("offset") || "0");

    const conditions = ["1=1"];
    const values = [];

    if (search) {
      values.push(`%${search}%`);
      const idx = values.length;
      conditions.push(
        `(al.user_email ILIKE $${idx} OR al.action ILIKE $${idx} OR al.entity_type ILIKE $${idx})`,
      );
    }

    if (action) {
      values.push(action);
      conditions.push(`al.action = $${values.length}`);
    }

    values.push(limit);
    values.push(offset);

    const logsQuery = `
      SELECT 
        al.*,
        au.first_name,
        au.last_name,
        au.role as user_role
      FROM audit_logs al
      LEFT JOIN auth_users au ON al.user_id = au.id
      WHERE ${conditions.join(" AND ")}
      ORDER BY al.created_at DESC
      LIMIT $${values.length - 1} OFFSET $${values.length}
    `;

    const countConditions = [...conditions];
    const countValues = values.slice(0, -2);
    const countQuery = `SELECT COUNT(*) as total FROM audit_logs al WHERE ${countConditions.join(" AND ")}`;

    const [logs, countResult] = await sql.transaction([
      sql(logsQuery, values),
      sql(countQuery, countValues),
    ]);

    return Response.json({
      logs,
      total: parseInt(countResult[0]?.total || 0),
    });
  } catch (err) {
    console.error("GET /api/audit-logs error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
