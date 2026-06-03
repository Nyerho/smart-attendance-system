import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const departments = await sql`
      SELECT d.*,
             COUNT(DISTINCT u.id) as member_count,
             COUNT(DISTINCT c.id) as class_count
      FROM departments d
      LEFT JOIN auth_users u ON u.department_id = d.id
      LEFT JOIN classes c ON c.department_id = d.id
      GROUP BY d.id
      ORDER BY d.name
    `;
    return Response.json({ departments });
  } catch (err) {
    console.error("GET /api/departments error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { name, code, description } = body;
    if (!name)
      return Response.json({ error: "Name is required" }, { status: 400 });

    const result = await sql`
      INSERT INTO departments (name, code, description)
      VALUES (${name}, ${code || null}, ${description || null})
      RETURNING *
    `;
    return Response.json({ department: result[0] }, { status: 201 });
  } catch (err) {
    console.error("POST /api/departments error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
