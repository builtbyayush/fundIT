/**
 * Bootstrap the first FundIt administrator.
 *
 * Usage:
 *   1. Copy .env.example to .env and set MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD
 *   2. Run: npm run seed:admin
 *
 * The script is idempotent: if an admin with the given email already exists, it exits without creating a duplicate.
 */
import { config as loadEnv } from "dotenv";

loadEnv();

async function seedAdmin() {
  const { connectToDatabase, disconnectFromDatabase } = await import("../src/lib/db");
  const { User } = await import("../src/models/User");
  const { UserRole } = await import("../src/constants/roles");
  const { normalizeEmail } = await import("../src/lib/auth/password");

  const name = process.env.ADMIN_NAME?.trim();
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    console.error(
      "Missing ADMIN_NAME, ADMIN_EMAIL, or ADMIN_PASSWORD. See .env.example.",
    );
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("ADMIN_PASSWORD must be at least 8 characters.");
    process.exit(1);
  }

  await connectToDatabase();

  const normalizedEmail = normalizeEmail(email);
  const existing = await User.findOne({
    email: normalizedEmail,
    role: UserRole.ADMIN,
  });

  if (existing) {
    console.log(`Admin already exists for ${normalizedEmail}. No changes made.`);
    await disconnectFromDatabase();
    process.exit(0);
  }

  await User.createAdmin({ name, email: normalizedEmail, password });
  console.log(`Admin created successfully for ${normalizedEmail}.`);

  await disconnectFromDatabase();
  process.exit(0);
}

seedAdmin().catch(async (error) => {
  console.error("Failed to seed admin.");
  console.error(error instanceof Error ? error.message : "Unknown error");
  process.exit(1);
});
