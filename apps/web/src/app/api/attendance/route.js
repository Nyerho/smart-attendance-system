import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const authSession = await auth();
    if (!authSession?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");
    const userId = searchParams.get("user_id");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build dynamic query with session join for titles
    let query = `
      SELECT 
        ar.*,
        ast.title AS session_title,
        ast.session_date,
        ast.status AS session_status
      FROM attendance_records ar
      LEFT JOIN attendance_sessions ast ON ar.session_id = ast.id
      WHERE 1=1
    `;
    const values = [];

    if (sessionId) {
      query += ` AND ar.session_id = $${values.length + 1}`;
      values.push(sessionId);
    }
    if (userId) {
      query += ` AND ar.user_id = $${values.length + 1}`;
      values.push(userId);
    }

    query += ` ORDER BY ar.check_in_time DESC LIMIT $${values.length + 1}`;
    values.push(limit);

    const records = await sql(query, values);
    return Response.json({ records });
  } catch (err) {
    console.error("GET /api/attendance error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authSession = await auth();
    if (!authSession?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const {
      session_id,
      method = "manual",
      status,
      user_id,
      user_name,
      user_email,
      lat,
      lng,
      notes,
    } = body;

    if (!session_id)
      return Response.json(
        { error: "session_id is required" },
        { status: 400 },
      );

    // Fetch session details
    const sessionRows =
      await sql`SELECT * FROM attendance_sessions WHERE id = ${session_id}`;
    if (!sessionRows.length)
      return Response.json({ error: "Session not found" }, { status: 404 });
    const sessionData = sessionRows[0];

    if (sessionData.status !== "active") {
      return Response.json({ error: "Session is not active" }, { status: 400 });
    }

    // Determine effective user
    const effectiveUserId = user_id || authSession.user.id;
    let effectiveName = user_name;
    let effectiveEmail = user_email;

    if (!effectiveName || !effectiveEmail) {
      const userRows =
        await sql`SELECT name, email FROM auth_users WHERE id = ${effectiveUserId}`;
      effectiveName = effectiveName || userRows[0]?.name || "Unknown";
      effectiveEmail = effectiveEmail || userRows[0]?.email || "";
    }

    // Determine attendance status based on timing
    const now = new Date();
    const sessionStart = new Date(sessionData.start_time);
    const minutesLate = Math.max(0, (now - sessionStart) / 60000);
    let attendanceStatus = status;
    if (!attendanceStatus) {
      attendanceStatus =
        minutesLate > sessionData.late_threshold_minutes ? "late" : "present";
    }

    // GPS check if session has coordinates
    if (sessionData.lat && sessionData.lng && lat && lng) {
      const R = 6371000; // Earth radius in meters
      const dLat = ((lat - parseFloat(sessionData.lat)) * Math.PI) / 180;
      const dLng = ((lng - parseFloat(sessionData.lng)) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat * Math.PI) / 180) *
          Math.cos((parseFloat(sessionData.lat) * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      if (distance > sessionData.radius_meters) {
        return Response.json(
          {
            error: `You are ${Math.round(distance)}m away from the session location. Must be within ${sessionData.radius_meters}m.`,
          },
          { status: 400 },
        );
      }
    }

    // Insert or update attendance record
    const existing =
      await sql`SELECT id FROM attendance_records WHERE session_id = ${session_id} AND user_id = ${effectiveUserId}`;
    let record;

    if (existing.length > 0) {
      // Update existing record
      const updated = await sql`
        UPDATE attendance_records 
        SET status = ${attendanceStatus}, method = ${method}, check_in_time = ${now}, lat = ${lat || null}, lng = ${lng || null}
        WHERE session_id = ${session_id} AND user_id = ${effectiveUserId}
        RETURNING *
      `;
      record = updated[0];
    } else {
      const inserted = await sql`
        INSERT INTO attendance_records (session_id, user_id, user_name, user_email, status, method, check_in_time, lat, lng, verified, notes)
        VALUES (${session_id}, ${effectiveUserId}, ${effectiveName}, ${effectiveEmail}, ${attendanceStatus}, ${method}, ${now}, ${lat || null}, ${lng || null}, true, ${notes || null})
        RETURNING *
      `;
      record = inserted[0];
    }

    // Audit log
    await sql`
      INSERT INTO audit_logs (user_id, user_email, action, entity_type, entity_id, details)
      VALUES (${authSession.user.id}, ${authSession.user.email}, 'mark_attendance', 'attendance_record', ${record.id}, 
              ${JSON.stringify({ session_id, method, status: attendanceStatus, user_name: effectiveName })})
    `;

    // Notification for late
    if (attendanceStatus === "late") {
      await sql`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (${effectiveUserId}, 'Late Arrival Recorded', ${"You were marked late for session: " + sessionData.title}, 'warning')
      `;
    }

    return Response.json({ record, status: attendanceStatus }, { status: 201 });
  } catch (err) {
    console.error("POST /api/attendance error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
