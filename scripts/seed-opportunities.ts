/**
 * Idempotent investment opportunity seed for development.
 *
 * Usage: npm run seed:opportunities
 *
 * Attaches OPEN opportunities with sample INR terms to published projects.
 * Does not invent equity, ROI, or instrument terms.
 */
import { config as loadEnv } from "dotenv";

loadEnv();

const TARGETS = [
  {
    slug: "medsense-clinical-assistant",
    fundingTargetMinor: 1_00_00_000_00,
    minimumInvestmentMinor: 1_000_00,
    maximumInvestmentMinor: 50_000_00,
  },
  {
    slug: "orbit-task-workspace",
    fundingTargetMinor: 75_00_000_00,
    minimumInvestmentMinor: 1_000_00,
    maximumInvestmentMinor: 50_000_00,
  },
  {
    slug: "greenleaf-daily-nutrition",
    fundingTargetMinor: 50_00_000_00,
    minimumInvestmentMinor: 1_000_00,
    maximumInvestmentMinor: 50_000_00,
  },
] as const;

async function seedOpportunities() {
  const { connectToDatabase, disconnectFromDatabase } = await import("../src/lib/db");
  const { Project } = await import("../src/models/Project");
  const { User } = await import("../src/models/User");
  const { InvestmentOpportunity } = await import("../src/models/InvestmentOpportunity");
  const { UserRole } = await import("../src/constants/roles");
  const { ProjectStatus } = await import("../src/constants/project-status");
  const { OpportunityStatus } = await import("../src/constants/opportunity-status");
  const { CurrencyCode } = await import("../src/constants/currency");

  await connectToDatabase();

  const admin = await User.findOne({ role: UserRole.ADMIN });
  if (!admin) {
    console.error("No admin user found. Run npm run seed:admin first.");
    await disconnectFromDatabase();
    process.exit(1);
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const target of TARGETS) {
    const project = await Project.findOne({ slug: target.slug, status: ProjectStatus.PUBLISHED });
    if (!project) {
      console.warn(`Skipping ${target.slug}: published project not found. Run seed:projects first.`);
      skipped += 1;
      continue;
    }

    const existing = await InvestmentOpportunity.findOne({ project: project._id });
    const terms = {
      currency: CurrencyCode.INR,
      fundingTarget: {
        amountMinor: target.fundingTargetMinor,
        currency: CurrencyCode.INR,
      },
      minimumInvestment: {
        amountMinor: target.minimumInvestmentMinor,
        currency: CurrencyCode.INR,
      },
      maximumInvestment: {
        amountMinor: target.maximumInvestmentMinor,
        currency: CurrencyCode.INR,
      },
      startDate: null,
      endDate: null,
      termsVersion: 1,
      status: OpportunityStatus.OPEN,
      createdBy: admin._id,
    };

    if (existing) {
      const needsRefresh =
        existing.fundingTarget?.amountMinor !== target.fundingTargetMinor ||
        existing.minimumInvestment?.amountMinor !== target.minimumInvestmentMinor ||
        existing.maximumInvestment?.amountMinor !== target.maximumInvestmentMinor;

      if (existing.status === OpportunityStatus.OPEN && !needsRefresh) {
        skipped += 1;
        continue;
      }

      existing.set(terms);
      await existing.save();
      updated += 1;
      continue;
    }

    await InvestmentOpportunity.create({
      project: project._id,
      ...terms,
      committedAmountMinor: 0,
    });
    created += 1;
  }

  console.log(
    `Opportunities seed complete. Created: ${created}. Updated: ${updated}. Skipped: ${skipped}.`,
  );
  console.log("Note: Sample terms are fictional INR placeholders for development only.");
  await disconnectFromDatabase();
  process.exit(0);
}

seedOpportunities().catch((error) => {
  console.error("Failed to seed opportunities.");
  console.error(error instanceof Error ? error.message : "Unknown error");
  process.exit(1);
});
