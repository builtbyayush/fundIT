import mongoose from "mongoose";

import { ApiError } from "@/lib/api/errors";
import { InvestmentOpportunity } from "@/models/InvestmentOpportunity";

/**
 * Atomically reserve committed funding for a confirmed investment.
 * Returns false if the funding target would be exceeded.
 */
export async function tryReserveFunding(
  opportunityId: string,
  amountMinor: number,
): Promise<boolean> {
  if (!mongoose.Types.ObjectId.isValid(opportunityId)) {
    throw new ApiError(400, "Invalid opportunity ID", "INVALID_ID");
  }
  if (!Number.isInteger(amountMinor) || amountMinor < 1) {
    throw new ApiError(400, "Invalid amount", "INVALID_AMOUNT");
  }

  const opportunity = await InvestmentOpportunity.findById(opportunityId);
  if (!opportunity) {
    throw new ApiError(404, "Opportunity not found", "NOT_FOUND");
  }

  if (!opportunity.fundingTarget) {
    await InvestmentOpportunity.updateOne(
      { _id: opportunityId },
      { $inc: { committedAmountMinor: amountMinor } },
    );
    return true;
  }

  const target = opportunity.fundingTarget.amountMinor;
  const result = await InvestmentOpportunity.updateOne(
    {
      _id: opportunityId,
      committedAmountMinor: { $lte: target - amountMinor },
    },
    { $inc: { committedAmountMinor: amountMinor } },
  );

  return result.modifiedCount === 1;
}

export async function releaseFundingReservation(
  opportunityId: string,
  amountMinor: number,
): Promise<void> {
  await InvestmentOpportunity.updateOne(
    { _id: opportunityId, committedAmountMinor: { $gte: amountMinor } },
    { $inc: { committedAmountMinor: -amountMinor } },
  );
}

export async function getFundingProgress(opportunityId: string) {
  const opportunity = await InvestmentOpportunity.findById(opportunityId);
  if (!opportunity) {
    throw new ApiError(404, "Opportunity not found", "NOT_FOUND");
  }

  const target = opportunity.fundingTarget?.amountMinor ?? null;
  const committed = opportunity.committedAmountMinor;
  const remaining = target === null ? null : Math.max(target - committed, 0);
  const percentage =
    target && target > 0 ? Math.min(Math.floor((committed * 100) / target), 100) : null;

  return {
    currency: opportunity.currency,
    target,
    committed,
    remaining,
    percentage,
  };
}
