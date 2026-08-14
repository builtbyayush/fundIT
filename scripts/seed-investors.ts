/**
 * Idempotent development investor seed.
 *
 * Usage: npm run seed:investors
 *
 * Creates fictional INVESTOR accounts for local manual testing.
 * Blocked in production unless ALLOW_DEMO_SEED=true is set explicitly.
 */
import { config as loadEnv } from "dotenv";

loadEnv();

async function seedInvestors() {
  const {
    assertDemoSeedAllowed,
    formatDemoInvestorSummary,
    getDemoInvestorPassword,
    seedDemoInvestors,
  } = await import("../src/lib/seed/demo-investors");
  const { connectToDatabase, disconnectFromDatabase } = await import("../src/lib/db");
  const { User } = await import("../src/models/User");
  const { UserRole } = await import("../src/constants/roles");

  try {
    assertDemoSeedAllowed();
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Demo seed blocked.");
    process.exit(1);
  }

  const password = getDemoInvestorPassword();
  await connectToDatabase();

  const results = await seedDemoInvestors();

  for (const result of results) {
    const verified = await User.verifyCredentials(result.email, password);
    if (!verified || verified.role !== UserRole.INVESTOR) {
      console.error(`Authentication verification failed for ${result.email}.`);
      await disconnectFromDatabase();
      process.exit(1);
    }
  }

  console.log(formatDemoInvestorSummary(results, password));
  await disconnectFromDatabase();
  process.exit(0);
}

seedInvestors().catch(async (error) => {
  console.error("Failed to seed demo investors.");
  console.error(error instanceof Error ? error.message : "Unknown error");
  process.exit(1);
});
