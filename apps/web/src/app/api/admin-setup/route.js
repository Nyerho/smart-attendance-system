import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

/**
 * IMPORTANT: This route promotes a user to admin.
 * SECURITY: Delete this file after you have created your first admin user!
 * Visit /admin-setup while signed in to promote your account to admin.
 */
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json(
        { error: "You must be signed in to use this route." },
        { status: 401 },
      );
    }

    await sql`UPDATE auth_users SET role = 'admin' WHERE id = ${session.user.id}`;

    await sql`
      INSERT INTO audit_logs (user_id, user_email, action, entity_type, entity_id, details)
      VALUES (${session.user.id}, ${session.user.email}, 'admin_self_promotion', 'auth_users', ${session.user.id}, '{"method":"admin_setup_route"}')
    `;

    return Response.json({
      success: true,
      message:
        "Your account has been promoted to admin! Please delete the /admin-setup page and API route after use.",
      user_id: session.user.id,
      email: session.user.email,
    });
  } catch (err) {
    console.error("POST /api/admin-setup error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
