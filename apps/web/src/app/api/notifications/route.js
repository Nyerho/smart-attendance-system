import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const notifications = await sql`
      SELECT * FROM notifications WHERE user_id = ${session.user.id}
      ORDER BY created_at DESC LIMIT 20
    `;
    return Response.json({ notifications });
  } catch (err) {
    console.error("GET /api/notifications error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { ids, mark_all_read } = body;

    if (mark_all_read) {
      await sql`UPDATE notifications SET is_read = true WHERE user_id = ${session.user.id}`;
    } else if (ids && ids.length > 0) {
      await sql`UPDATE notifications SET is_read = true WHERE id = ANY(${ids}) AND user_id = ${session.user.id}`;
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/notifications error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
