import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const classes = await sql`
      SELECT c.*, d.name as department_name, u.name as teacher_name
      FROM classes c
      LEFT JOIN departments d ON d.id = c.department_id
      LEFT JOIN auth_users u ON u.id = c.teacher_id
      ORDER BY c.name
    `;
    return Response.json({ classes });
  } catch (err) {
    console.error("GET /api/classes error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const {
      name,
      code,
      department_id,
      teacher_id,
      schedule,
      location,
      max_students = 50,
    } = body;

    if (!name)
      return Response.json({ error: "Name is required" }, { status: 400 });

    const result = await sql`
      INSERT INTO classes (name, code, department_id, teacher_id, schedule, location, max_students)
      VALUES (${name}, ${code || null}, ${department_id || null}, ${teacher_id || null}, ${schedule || null}, ${location || null}, ${max_students})
      RETURNING *
    `;
    return Response.json({ class: result[0] }, { status: 201 });
  } catch (err) {
    console.error("POST /api/classes error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
