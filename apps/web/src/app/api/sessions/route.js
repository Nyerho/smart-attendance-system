import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";
import { randomBytes } from "crypto";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let query = `
      SELECT s.*, c.name as class_name, u.name as teacher_name,
             (SELECT COUNT(*) FROM attendance_records ar WHERE ar.session_id = s.id) as checkin_count
      FROM attendance_sessions s
      LEFT JOIN classes c ON c.id = s.class_id
      LEFT JOIN auth_users u ON u.id = s.teacher_id
      WHERE 1=1
    `;
    const values = [];

    if (status) {
      query += ` AND s.status = $${values.length + 1}`;
      values.push(status);
    }
    if (search) {
      query += ` AND s.title ILIKE $${values.length + 1}`;
      values.push(`%${search}%`);
    }

    query += ` ORDER BY s.created_at DESC LIMIT $${values.length + 1}`;
    values.push(limit);

    const sessions = await sql(query, values);
    return Response.json({ sessions });
  } catch (err) {
    console.error("GET /api/sessions error:", err);
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
      title,
      class_id,
      late_threshold_minutes = 15,
      allow_qr = true,
      allow_face = false,
      allow_manual = true,
      radius_meters = 100,
      lat,
      lng,
    } = body;

    if (!title)
      return Response.json({ error: "Title is required" }, { status: 400 });

    const token = randomBytes(16).toString("hex");
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    const result = await sql`
      INSERT INTO attendance_sessions (
        title, class_id, teacher_id, session_date, start_time,
        late_threshold_minutes, allow_qr, allow_face, allow_manual,
        radius_meters, lat, lng, session_token, status
      ) VALUES (
        ${title}, ${class_id || null}, ${session.user.id}, ${today}, ${now},
        ${late_threshold_minutes}, ${allow_qr}, ${allow_face}, ${allow_manual},
        ${radius_meters}, ${lat || null}, ${lng || null}, ${token}, 'active'
      ) RETURNING *
    `;

    // Audit log
    await sql`
      INSERT INTO audit_logs (user_id, user_email, action, entity_type, entity_id, details)
      VALUES (${session.user.id}, ${session.user.email}, 'create_session', 'attendance_session', ${result[0].id}, ${JSON.stringify({ title })})
    `;

    return Response.json({ session: result[0] }, { status: 201 });
  } catch (err) {
    console.error("POST /api/sessions error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
