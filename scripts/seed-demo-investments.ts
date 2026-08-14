/**
 * Optional demo investment states for development.
 *
 * Usage: npm run seed:demo-investments
 *
 * Creates a small set of fictional investments via existing domain services:
 *   - Rahul Sharma → CONFIRMED
 *   - Priya Mehta → PAYMENT_PENDING
 *   - Arjun Kapoor → FAILED
 *
 * Requires seed:investors, seed:projects, and seed:opportunities first.
 * Blocked in production unless ALLOW_DEMO_SEED=true is set explicitly.
 */
import { config as loadEnv } from "dotenv";

loadEnv();

async function seedDemoInvestmentsScript() {
  const { assertDemoSeedAllowed } = await import("../src/lib/seed/demo-investors");
  const {
    formatDemoInvestmentSummary,
    seedDemoInvestments,
  } = await import("../src/lib/seed/demo-investments");
  const { connectToDatabase, disconnectFromDatabase } = await import("../src/lib/db");

  try {
    assertDemoSeedAllowed();
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Demo seed blocked.");
    process.exit(1);
  }

  await connectToDatabase();

  const results = await seedDemoInvestments();
  console.log(formatDemoInvestmentSummary(results));

  await disconnectFromDatabase();
  process.exit(0);
}

seedDemoInvestmentsScript().catch(async (error) => {
  console.error("Failed to seed demo investments.");
  console.error(error instanceof Error ? error.message : "Unknown error");
  process.exit(1);
});
