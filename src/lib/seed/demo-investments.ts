import { InvestmentStatus } from "@/constants/investment-status";
import { normalizeEmail } from "@/lib/auth/password";
import {
  createInvestment,
  getInvestorInvestment,
} from "@/services/investment.service";
import {
  createPaymentOrderForInvestment,
  verifyAndCompleteMockPayment,
} from "@/services/payment.service";
import { Investment } from "@/models/Investment";
import { Project } from "@/models/Project";
import { User } from "@/models/User";

export const DEMO_INVESTMENT_AMOUNT_MINOR = 50_000_00;

export type DemoInvestmentTarget = {
  investorEmail: string;
  projectSlug: string;
  targetStatus: "CONFIRMED" | "PAYMENT_PENDING" | "FAILED";
};

export const DEMO_INVESTMENT_TARGETS: readonly DemoInvestmentTarget[] = [
  {
    investorEmail: "demo.investor1@fundit.local",
    projectSlug: "medsense-clinical-assistant",
    targetStatus: "CONFIRMED",
  },
  {
    investorEmail: "demo.investor2@fundit.local",
    projectSlug: "orbit-task-workspace",
    targetStatus: "PAYMENT_PENDING",
  },
  {
    investorEmail: "demo.investor3@fundit.local",
    projectSlug: "medsense-clinical-assistant",
    targetStatus: "FAILED",
  },
] as const;

export type DemoInvestmentSeedResult = {
  investorEmail: string;
  projectSlug: string;
  targetStatus: DemoInvestmentTarget["targetStatus"];
  status: "created" | "existing" | "skipped";
  investmentNumber?: string;
  reason?: string;
};

export async function seedDemoInvestments(): Promise<DemoInvestmentSeedResult[]> {
  if (process.env.PAYMENT_PROVIDER !== "mock") {
    throw new Error(
      "Demo investment seed requires PAYMENT_PROVIDER=mock. Current provider is not mock.",
    );
  }

  const results: DemoInvestmentSeedResult[] = [];

  for (const target of DEMO_INVESTMENT_TARGETS) {
    const investor = await User.findByEmail(normalizeEmail(target.investorEmail));
    if (!investor) {
      results.push({
        ...target,
        status: "skipped",
        reason: "Investor not found. Run npm run seed:investors first.",
      });
      continue;
    }

    const project = await Project.findOne({ slug: target.projectSlug });
    if (!project) {
      results.push({
        ...target,
        status: "skipped",
        reason: `Project "${target.projectSlug}" not found. Run npm run seed:projects first.`,
      });
      continue;
    }

    const existing = await Investment.findOne({
      investor: investor._id,
      project: project._id,
    });

    if (existing) {
      results.push({
        ...target,
        status: "existing",
        investmentNumber: existing.investmentNumber,
      });
      continue;
    }

    const investment = await createInvestment({
      projectId: project._id.toString(),
      investorId: investor._id.toString(),
      amountMinor: DEMO_INVESTMENT_AMOUNT_MINOR,
    });

    if (target.targetStatus === "CONFIRMED" || target.targetStatus === "FAILED") {
      const payment = await createPaymentOrderForInvestment(investment._id.toString());
      await verifyAndCompleteMockPayment({
        investmentId: investment._id.toString(),
        providerOrderId: payment.order.providerOrderId,
        outcome: target.targetStatus === "CONFIRMED" ? "success" : "failure",
      });
    } else {
      await createPaymentOrderForInvestment(investment._id.toString());
    }

    const finalInvestment = await Investment.findById(investment._id);
    const expectedStatus =
      target.targetStatus === "CONFIRMED"
        ? InvestmentStatus.CONFIRMED
        : target.targetStatus === "PAYMENT_PENDING"
          ? InvestmentStatus.PAYMENT_PENDING
          : InvestmentStatus.FAILED;

    if (!finalInvestment || finalInvestment.status !== expectedStatus) {
      throw new Error(
        `Demo investment for ${target.investorEmail} ended in ${finalInvestment?.status ?? "unknown"} instead of ${expectedStatus}.`,
      );
    }

    // Verify investor isolation via the existing service layer.
    await getInvestorInvestment(finalInvestment._id.toString(), investor._id.toString());

    results.push({
      ...target,
      status: "created",
      investmentNumber: finalInvestment.investmentNumber,
    });
  }

  return results;
}

export function formatDemoInvestmentSummary(results: DemoInvestmentSeedResult[]): string {
  const lines = [
    "FundIt Development Demo Investments",
    "────────────────────────────────────",
    "",
  ];

  for (const result of results) {
    lines.push(`• ${result.investorEmail} → ${result.projectSlug} (${result.targetStatus})`);
    if (result.investmentNumber) {
      lines.push(`  Investment: ${result.investmentNumber}`);
    }
    lines.push(`  Status: ${result.status}`);
    if (result.reason) {
      lines.push(`  Note: ${result.reason}`);
    }
    lines.push("");
  }

  lines.push("Note: Fictional demo investments for development testing only.");

  return lines.join("\n");
}
