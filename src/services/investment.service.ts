import mongoose from "mongoose";

import {
  InvestmentStatus,
  canTransitionInvestmentStatus,
  type InvestmentStatus as InvestmentStatusType,
} from "@/constants/investment-status";
import { PaymentStatus } from "@/constants/payment-status";
import { ProjectStatus } from "@/constants/project-status";
import { ApiError } from "@/lib/api/errors";
import { isAtLeast, isAtMost, sameCurrency } from "@/lib/money";
import { writeAuditLog } from "@/services/audit.service";
import {
  getOpportunityByProjectId,
  isOpportunityCurrentlyInvestable,
} from "@/services/opportunity.service";
import { tryReserveFunding, releaseFundingReservation } from "@/services/funding.service";
import { Investment, type IInvestmentDocument } from "@/models/Investment";
import { getNextSequence } from "@/models/Counter";
import { Project } from "@/models/Project";

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

async function generateInvestmentNumber(): Promise<string> {
  const seq = await getNextSequence("investment");
  return `FD-INV-${String(seq).padStart(6, "0")}`;
}

export async function createInvestment(input: {
  projectId: string;
  investorId: string;
  amountMinor: number;
}): Promise<IInvestmentDocument> {
  if (!mongoose.Types.ObjectId.isValid(input.projectId)) {
    throw new ApiError(400, "Invalid project ID", "INVALID_ID");
  }
  if (!Number.isInteger(input.amountMinor) || input.amountMinor < 1) {
    throw new ApiError(400, "Invalid investment amount", "INVALID_AMOUNT");
  }

  const project = await Project.findById(input.projectId);
  if (!project || project.status !== ProjectStatus.PUBLISHED) {
    throw new ApiError(400, "Project is not available for investment", "PROJECT_NOT_INVESTABLE");
  }

  const opportunity = await getOpportunityByProjectId(input.projectId);
  if (!opportunity || !isOpportunityCurrentlyInvestable(opportunity)) {
    throw new ApiError(400, "This opportunity is not open for investment", "OPPORTUNITY_CLOSED");
  }

  if (opportunity.minimumInvestment) {
    if (!sameCurrency(opportunity.currency, opportunity.minimumInvestment.currency)) {
      throw new ApiError(400, "Currency mismatch", "INVALID_CURRENCY");
    }
    if (!isAtLeast(input.amountMinor, opportunity.minimumInvestment.amountMinor)) {
      throw new ApiError(400, "Amount is below the minimum investment", "BELOW_MINIMUM");
    }
  }

  if (opportunity.maximumInvestment) {
    if (!sameCurrency(opportunity.currency, opportunity.maximumInvestment.currency)) {
      throw new ApiError(400, "Currency mismatch", "INVALID_CURRENCY");
    }
    if (!isAtMost(input.amountMinor, opportunity.maximumInvestment.amountMinor)) {
      throw new ApiError(400, "Amount exceeds the maximum investment", "ABOVE_MAXIMUM");
    }
  }

  if (opportunity.fundingTarget) {
    const remaining =
      opportunity.fundingTarget.amountMinor - opportunity.committedAmountMinor;
    if (input.amountMinor > remaining) {
      throw new ApiError(400, "Amount exceeds remaining funding target", "FUNDING_TARGET");
    }
  }

  const investmentNumber = await generateInvestmentNumber();

  const investment = await Investment.create({
    investmentNumber,
    investor: input.investorId,
    opportunity: opportunity._id,
    project: project._id,
    amountMinor: input.amountMinor,
    currency: opportunity.currency,
    status: InvestmentStatus.INITIATED,
    paymentStatus: PaymentStatus.NOT_STARTED,
    termsVersion: opportunity.termsVersion,
    initiatedAt: new Date(),
  });

  await writeAuditLog({
    actorType: "USER",
    actorId: input.investorId,
    action: "investment.initiated",
    entityType: "Investment",
    entityId: investment._id.toString(),
    metadata: {
      investmentNumber,
      amountMinor: input.amountMinor,
      currency: opportunity.currency,
      termsVersion: opportunity.termsVersion,
    },
  });

  return investment;
}

export async function getInvestmentById(id: string): Promise<IInvestmentDocument> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid investment ID", "INVALID_ID");
  }
  const investment = await Investment.findById(id);
  if (!investment) {
    throw new ApiError(404, "Investment not found", "NOT_FOUND");
  }
  return investment;
}

export async function getInvestorInvestment(
  id: string,
  investorId: string,
): Promise<IInvestmentDocument> {
  const investment = await getInvestmentById(id);
  if (investment.investor.toString() !== investorId) {
    throw new ApiError(403, "You cannot access this investment", "FORBIDDEN");
  }
  return investment;
}

export async function listInvestorInvestments(
  investorId: string,
  page: number,
  limit: number,
): Promise<PaginatedResult<IInvestmentDocument>> {
  const filter = { investor: investorId };
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Investment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("project", "title slug"),
    Investment.countDocuments(filter),
  ]);

  return {
    items: items as unknown as IInvestmentDocument[],
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 0,
  };
}

export async function listAdminInvestments(query: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  paymentStatus?: string;
}): Promise<PaginatedResult<IInvestmentDocument>> {
  const filter: Record<string, unknown> = {};
  if (query.status) filter.status = query.status;
  if (query.paymentStatus) filter.paymentStatus = query.paymentStatus;
  if (query.search) {
    filter.investmentNumber = { $regex: query.search, $options: "i" };
  }

  const skip = (query.page - 1) * query.limit;
  const [items, total] = await Promise.all([
    Investment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(query.limit)
      .populate("project", "title slug")
      .populate("investor", "name email"),
    Investment.countDocuments(filter),
  ]);

  return {
    items: items as unknown as IInvestmentDocument[],
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.ceil(total / query.limit) || 0,
  };
}

export async function transitionInvestmentStatus(
  investment: IInvestmentDocument,
  next: InvestmentStatusType,
): Promise<IInvestmentDocument> {
  if (investment.status === next) {
    return investment;
  }
  if (!canTransitionInvestmentStatus(investment.status, next)) {
    throw new ApiError(
      400,
      `Cannot transition investment from ${investment.status} to ${next}`,
      "INVALID_TRANSITION",
    );
  }

  investment.status = next;
  if (next === InvestmentStatus.CONFIRMED) {
    investment.confirmedAt = new Date();
  }
  if (next === InvestmentStatus.CANCELLED) {
    investment.cancelledAt = new Date();
  }
  if (next === InvestmentStatus.FAILED) {
    investment.failedAt = new Date();
  }
  if (next === InvestmentStatus.REFUNDED) {
    investment.refundedAt = new Date();
  }

  await investment.save();
  return investment;
}

export async function confirmInvestment(
  investmentId: string,
): Promise<IInvestmentDocument> {
  let investment = await getInvestmentById(investmentId);

  if (investment.status === InvestmentStatus.CONFIRMED) {
    return investment;
  }

  if (investment.status === InvestmentStatus.PAYMENT_PENDING) {
    investment = await transitionInvestmentStatus(
      investment,
      InvestmentStatus.PAYMENT_SUCCESS,
    );
  }

  if (investment.status !== InvestmentStatus.PAYMENT_SUCCESS) {
    throw new ApiError(
      400,
      "Investment cannot be confirmed from the current state",
      "INVALID_TRANSITION",
    );
  }

  const reserved = await tryReserveFunding(
    investment.opportunity.toString(),
    investment.amountMinor,
  );

  if (!reserved) {
    investment.paymentStatus = PaymentStatus.FAILED;
    await transitionInvestmentStatus(investment, InvestmentStatus.FAILED);
    throw new ApiError(409, "Funding target reached", "FUNDING_TARGET_REACHED");
  }

  try {
    investment.paymentStatus = PaymentStatus.SUCCESS;
    investment = await transitionInvestmentStatus(
      investment,
      InvestmentStatus.CONFIRMED,
    );

    await writeAuditLog({
      actorType: "SYSTEM",
      action: "investment.confirmed",
      entityType: "Investment",
      entityId: investment._id.toString(),
      metadata: { investmentNumber: investment.investmentNumber },
    });

    return investment;
  } catch (error) {
    await releaseFundingReservation(
      investment.opportunity.toString(),
      investment.amountMinor,
    );
    throw error;
  }
}

export async function failInvestment(
  investmentId: string,
  reason?: string,
): Promise<IInvestmentDocument> {
  const investment = await getInvestmentById(investmentId);
  if (
    investment.status === InvestmentStatus.CONFIRMED ||
    investment.status === InvestmentStatus.FAILED ||
    investment.status === InvestmentStatus.CANCELLED
  ) {
    return investment;
  }

  investment.paymentStatus = PaymentStatus.FAILED;
  await transitionInvestmentStatus(investment, InvestmentStatus.FAILED);

  await writeAuditLog({
    actorType: "SYSTEM",
    action: "investment.failed",
    entityType: "Investment",
    entityId: investment._id.toString(),
    metadata: { reason },
  });

  return investment;
}

export function serializeInvestment(investment: IInvestmentDocument) {
  const project = investment.project as unknown as
    | { _id: mongoose.Types.ObjectId; title?: string; slug?: string }
    | mongoose.Types.ObjectId;
  const investor = investment.investor as unknown as
    | { _id: mongoose.Types.ObjectId; name?: string; email?: string }
    | mongoose.Types.ObjectId;

  return {
    id: investment._id.toString(),
    investmentNumber: investment.investmentNumber,
    amountMinor: investment.amountMinor,
    currency: investment.currency,
    status: investment.status,
    paymentStatus: investment.paymentStatus,
    termsVersion: investment.termsVersion,
    initiatedAt: investment.initiatedAt,
    confirmedAt: investment.confirmedAt,
    cancelledAt: investment.cancelledAt,
    failedAt: investment.failedAt,
    createdAt: investment.createdAt,
    project:
      project && typeof project === "object" && "title" in project
        ? {
            id: project._id.toString(),
            title: project.title,
            slug: project.slug,
          }
        : { id: String(project) },
    investor:
      investor && typeof investor === "object" && "email" in investor
        ? {
            id: investor._id.toString(),
            name: investor.name,
            email: investor.email,
          }
        : { id: String(investor) },
  };
}

export async function getInvestorInvestmentStats(investorId: string) {
  const [total, confirmed, pending] = await Promise.all([
    Investment.countDocuments({ investor: investorId }),
    Investment.countDocuments({
      investor: investorId,
      status: InvestmentStatus.CONFIRMED,
    }),
    Investment.countDocuments({
      investor: investorId,
      status: {
        $in: [InvestmentStatus.INITIATED, InvestmentStatus.PAYMENT_PENDING],
      },
    }),
  ]);

  const confirmedAgg = await Investment.aggregate<{ total: number }>([
    {
      $match: {
        investor: new mongoose.Types.ObjectId(investorId),
        status: InvestmentStatus.CONFIRMED,
      },
    },
    { $group: { _id: null, total: { $sum: "$amountMinor" } } },
  ]);

  return {
    total,
    confirmed,
    pending,
    confirmedAmountMinor: confirmedAgg[0]?.total ?? 0,
  };
}

export async function getAdminInvestmentStats() {
  const [total, confirmed, pendingPayments] = await Promise.all([
    Investment.countDocuments(),
    Investment.countDocuments({ status: InvestmentStatus.CONFIRMED }),
    Investment.countDocuments({
      status: {
        $in: [InvestmentStatus.INITIATED, InvestmentStatus.PAYMENT_PENDING],
      },
    }),
  ]);

  const confirmedAgg = await Investment.aggregate<{ total: number }>([
    { $match: { status: InvestmentStatus.CONFIRMED } },
    { $group: { _id: null, total: { $sum: "$amountMinor" } } },
  ]);

  return {
    total,
    confirmed,
    pendingPayments,
    confirmedAmountMinor: confirmedAgg[0]?.total ?? 0,
  };
}
