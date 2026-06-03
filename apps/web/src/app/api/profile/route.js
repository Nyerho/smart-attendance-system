import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const rows = await sql`
      SELECT id, name, email, image, role, phone, organization, department_id, employee_id, avatar_url
      FROM auth_users WHERE id = ${session.user.id} LIMIT 1
    `;
    return Response.json({ user: rows[0] || null });
  } catch (err) {
    console.error("GET /api/profile error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const { name, role, phone, organization, department_id, employee_id } =
      body;

    const setClauses = [];
    const values = [];
    const addField = (col, val) => {
      if (val !== undefined && val !== null) {
        setClauses.push(`${col} = $${values.length + 1}`);
        values.push(val);
      }
    };
    addField("phone", phone);
    addField("organization", organization);
    addField("department_id", department_id);
    addField("employee_id", employee_id);
    if (name && typeof name === "string") addField("name", name.trim());
    // Only allow setting role during onboarding (not admin/super_admin via this route)
    if (role && ["student", "teacher", "employee", "manager"].includes(role)) {
      addField("role", role);
    }

    if (setClauses.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    values.push(session.user.id);
    const query = `UPDATE auth_users SET ${setClauses.join(", ")} WHERE id = $${values.length} RETURNING id, name, email, role, phone, organization`;
    const result = await sql(query, values);
    return Response.json({ user: result[0] || null });
  } catch (err) {
    console.error("PUT /api/profile error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
