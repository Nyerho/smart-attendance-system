import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

/**
 * POST /api/sessions/checkin
 * Token-based attendance check-in (used by mobile QR scanner)
 * Body: { session_token, method, lat, lng }
 */
export async function POST(request) {
  try {
    const authSession = await auth();
    if (!authSession?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { session_token, method = "qr", lat, lng } = body;

    if (!session_token) {
      return Response.json(
        { error: "session_token is required" },
        { status: 400 },
      );
    }

    // Look up session by token
    const sessionRows = await sql`
      SELECT * FROM attendance_sessions 
      WHERE session_token = ${session_token}
      LIMIT 1
    `;

    if (!sessionRows.length) {
      return Response.json(
        {
          error:
            "Invalid session token. Make sure you scanned the correct QR code.",
        },
        { status: 404 },
      );
    }

    const sessionData = sessionRows[0];

    if (sessionData.status !== "active") {
      return Response.json(
        {
          error: `Session is currently ${sessionData.status}. It must be active to check in.`,
        },
        { status: 400 },
      );
    }

    // Check session hasn't expired (end_time)
    if (sessionData.end_time && new Date() > new Date(sessionData.end_time)) {
      return Response.json(
        { error: "This session has ended. You can no longer check in." },
        { status: 400 },
      );
    }

    // GPS proximity check
    if (sessionData.lat && sessionData.lng && lat && lng) {
      const R = 6371000;
      const dLat = ((lat - parseFloat(sessionData.lat)) * Math.PI) / 180;
      const dLng = ((lng - parseFloat(sessionData.lng)) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat * Math.PI) / 180) *
          Math.cos((parseFloat(sessionData.lat) * Math.PI) / 180) *
          Math.sin(dLng / 2) ** 2;
      const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      if (distance > sessionData.radius_meters) {
        return Response.json(
          {
            error: `You are ${Math.round(distance)}m from the classroom. Must be within ${sessionData.radius_meters}m to check in.`,
          },
          { status: 400 },
        );
      }
    }

    // Get user info
    const userRows = await sql`
      SELECT id, email, first_name, last_name, name 
      FROM auth_users WHERE id = ${authSession.user.id}
    `;
    const user = userRows[0];
    const userName = user
      ? [user.first_name, user.last_name].filter(Boolean).join(" ") ||
        user.name ||
        user.email
      : authSession.user.name || authSession.user.email;
    const userEmail = user?.email || authSession.user.email;

    // Determine attendance status based on timing
    const now = new Date();
    const sessionStart = new Date(sessionData.start_time);
    const minutesLate = Math.max(0, (now - sessionStart) / 60000);
    const attendanceStatus =
      minutesLate > sessionData.late_threshold_minutes ? "late" : "present";

    // Check for existing record (duplicate prevention)
    const existing = await sql`
      SELECT id, status FROM attendance_records 
      WHERE session_id = ${sessionData.id} AND user_id = ${authSession.user.id}
    `;

    let record;
    if (existing.length > 0) {
      // Already checked in — return existing record info
      return Response.json({
        message: "Already checked in",
        already_checked_in: true,
        attendance_status: existing[0].status,
        session_title: sessionData.title,
        session_id: sessionData.id,
      });
    }

    // Insert new record
    const inserted = await sql`
      INSERT INTO attendance_records 
        (session_id, user_id, user_name, user_email, status, method, check_in_time, lat, lng, verified)
      VALUES 
        (${sessionData.id}, ${authSession.user.id}, ${userName}, ${userEmail}, 
         ${attendanceStatus}, ${method}, ${now}, 
         ${lat || null}, ${lng || null}, true)
      RETURNING *
    `;
    record = inserted[0];

    // Audit log
    await sql`
      INSERT INTO audit_logs (user_id, user_email, action, entity_type, entity_id, details)
      VALUES (
        ${authSession.user.id}, ${userEmail}, 'qr_checkin', 
        'attendance_record', ${record.id},
        ${JSON.stringify({ session_id: sessionData.id, method, status: attendanceStatus, session_title: sessionData.title })}
      )
    `;

    // Late notification
    if (attendanceStatus === "late") {
      await sql`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (
          ${authSession.user.id}, 
          'Late Arrival Recorded', 
          ${`You were marked late for "${sessionData.title}". You arrived ${Math.round(minutesLate)} minutes after the session started.`}, 
          'warning'
        )
      `;
    }

    return Response.json(
      {
        success: true,
        record,
        attendance_status: attendanceStatus,
        session_title: sessionData.title,
        session_id: sessionData.id,
        minutes_late: Math.round(minutesLate),
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("POST /api/sessions/checkin error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
