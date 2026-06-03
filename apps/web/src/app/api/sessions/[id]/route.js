import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = params;
    const rows = await sql`
      SELECT s.*, c.name as class_name, c.code as class_code, u.name as teacher_name,
             (SELECT COUNT(*) FROM attendance_records ar WHERE ar.session_id = s.id) as checkin_count
      FROM attendance_sessions s
      LEFT JOIN classes c ON c.id = s.class_id
      LEFT JOIN auth_users u ON u.id = s.teacher_id
      WHERE s.id = ${id}
    `;
    if (!rows.length)
      return Response.json({ error: "Session not found" }, { status: 404 });
    return Response.json({ session: rows[0] });
  } catch (err) {
    console.error("GET /api/sessions/[id] error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = params;
    const body = await request.json();
    const { status } = body;

    if (!["active", "ended", "paused"].includes(status)) {
      return Response.json({ error: "Invalid status" }, { status: 400 });
    }

    const setClauses = [`status = $1`];
    const values = [status];

    if (status === "ended") {
      setClauses.push(`end_time = $${values.length + 1}`);
      values.push(new Date());
    }

    values.push(id);
    const query = `UPDATE attendance_sessions SET ${setClauses.join(", ")} WHERE id = $${values.length} RETURNING *`;
    const result = await sql(query, values);

    return Response.json({ session: result[0] });
  } catch (err) {
    console.error("PATCH /api/sessions/[id] error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = params;
    await sql`DELETE FROM attendance_sessions WHERE id = ${id}`;
    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/sessions/[id] error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
