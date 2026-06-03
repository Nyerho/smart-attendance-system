import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const userRows =
      await sql`SELECT role FROM auth_users WHERE id = ${session.user.id}`;
    const userRole = userRows[0]?.role;
    if (!["admin", "super_admin", "teacher"].includes(userRole)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const role = searchParams.get("role");
    const limit = parseInt(searchParams.get("limit") || "50");

    let query = `
      SELECT u.id, u.name, u.email, u.role, u.organization, u.phone, u.created_at,
             d.name as department_name
      FROM auth_users u
      LEFT JOIN departments d ON d.id = u.department_id
      WHERE 1=1
    `;
    const values = [];

    if (search) {
      query += ` AND (u.name ILIKE $${values.length + 1} OR u.email ILIKE $${values.length + 1})`;
      values.push(`%${search}%`);
    }
    if (role) {
      query += ` AND u.role = $${values.length + 1}`;
      values.push(role);
    }

    query += ` ORDER BY u.created_at DESC LIMIT $${values.length + 1}`;
    values.push(limit);

    const users = await sql(query, values);
    return Response.json({ users });
  } catch (err) {
    console.error("GET /api/users error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const adminRows =
      await sql`SELECT role FROM auth_users WHERE id = ${session.user.id}`;
    if (!["admin", "super_admin"].includes(adminRows[0]?.role)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { id, role } = body;

    if (!id || !role)
      return Response.json({ error: "id and role required" }, { status: 400 });
    if (
      !["student", "teacher", "employee", "admin", "manager"].includes(role)
    ) {
      return Response.json({ error: "Invalid role" }, { status: 400 });
    }

    const result =
      await sql`UPDATE auth_users SET role = ${role} WHERE id = ${id} RETURNING id, name, email, role`;
    return Response.json({ user: result[0] });
  } catch (err) {
    console.error("PATCH /api/users error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
