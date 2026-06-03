import sql from "@/app/api/utils/sql";
import argon2 from "argon2";

/**
 * POST /api/seed-demo
 * Creates demo accounts for testing. Safe to call multiple times.
 */
export async function POST() {
  try {
    const passwordHash = await argon2.hash("demo1234");

    const demoUsers = [
      {
        email: "admin@demo.com",
        name: "Admin User",
        first_name: "Admin",
        last_name: "User",
        role: "admin",
        organization: "Demo University",
        employee_id: "ADMIN001",
      },
      {
        email: "teacher@demo.com",
        name: "Dr. Sarah Teacher",
        first_name: "Sarah",
        last_name: "Teacher",
        role: "teacher",
        organization: "Demo University",
        employee_id: "TCH001",
      },
      {
        email: "student@demo.com",
        name: "John Student",
        first_name: "John",
        last_name: "Student",
        role: "student",
        organization: "Demo University",
        employee_id: "STU001",
      },
      {
        email: "manager@demo.com",
        name: "Mark Manager",
        first_name: "Mark",
        last_name: "Manager",
        role: "manager",
        organization: "Demo University",
        employee_id: "MGR001",
      },
    ];

    const results = [];

    for (const u of demoUsers) {
      // Check if user already exists
      const existing =
        await sql`SELECT id FROM auth_users WHERE email = ${u.email}`;

      if (existing.length > 0) {
        // Update password & role to make sure it's correct
        await sql`
          UPDATE auth_users 
          SET password_hash = ${passwordHash}, role = ${u.role}, first_name = ${u.first_name}, last_name = ${u.last_name}, organization = ${u.organization}
          WHERE email = ${u.email}
        `;
        // Also update auth_accounts password
        await sql`
          UPDATE auth_accounts SET password = ${passwordHash} WHERE "userId" = ${existing[0].id}
        `;
        results.push({ email: u.email, status: "updated" });
      } else {
        // Insert into auth_users
        const inserted = await sql`
          INSERT INTO auth_users (email, password_hash, first_name, last_name, role, organization, employee_id, email_verified, is_active)
          VALUES (${u.email}, ${passwordHash}, ${u.first_name}, ${u.last_name}, ${u.role}, ${u.organization}, ${u.employee_id}, true, true)
          RETURNING id
        `;
        const userId = inserted[0].id;

        // Insert into auth_accounts (needed for credential login)
        await sql`
          INSERT INTO auth_accounts ("userId", type, provider, "providerAccountId", password)
          VALUES (${userId}, 'credentials', 'credentials', ${u.email}, ${passwordHash})
          ON CONFLICT DO NOTHING
        `;

        results.push({ email: u.email, status: "created" });
      }
    }

    return Response.json({
      success: true,
      message:
        "Demo accounts ready! You can now sign in with any demo account using password: demo1234",
      accounts: results,
    });
  } catch (err) {
    console.error("POST /api/seed-demo error:", err);
    return Response.json(
      { error: "Failed to seed demo accounts: " + err.message },
      { status: 500 },
    );
  }
}
