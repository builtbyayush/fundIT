import mongoose from "mongoose";

import { ProjectStatus } from "@/constants/project-status";
import {
  canTransitionOpportunityStatus,
  canAcceptInvestments,
  OpportunityStatus,
  type OpportunityStatus as OpportunityStatusType,
} from "@/constants/opportunity-status";
import { ApiError } from "@/lib/api/errors";
import type { OpportunityInput } from "@/lib/validations/investment";
import { writeAuditLog } from "@/services/audit.service";
import {
  InvestmentOpportunity,
  type IInvestmentOpportunityDocument,
} from "@/models/InvestmentOpportunity";
import { Project } from "@/models/Project";

function assertObjectId(id: string, label = "ID") {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, `Invalid ${label}`, "INVALID_ID");
  }
}

export async function getOpportunityByProjectId(
  projectId: string,
): Promise<IInvestmentOpportunityDocument | null> {
  assertObjectId(projectId, "project ID");
  return InvestmentOpportunity.findOne({ project: projectId });
}

export async function getOpportunityById(
  id: string,
): Promise<IInvestmentOpportunityDocument> {
  assertObjectId(id, "opportunity ID");
  const opportunity = await InvestmentOpportunity.findById(id);
  if (!opportunity) {
    throw new ApiError(404, "Investment opportunity not found", "NOT_FOUND");
  }
  return opportunity;
}

function assertOpenable(opportunity: IInvestmentOpportunityDocument) {
  if (opportunity.fundingTarget && opportunity.fundingTarget.amountMinor < 1) {
    throw new ApiError(400, "Funding target must be positive", "INVALID_CONFIG");
  }
  if (
    opportunity.minimumInvestment &&
    opportunity.maximumInvestment &&
    opportunity.minimumInvestment.amountMinor > opportunity.maximumInvestment.amountMinor
  ) {
    throw new ApiError(
      400,
      "Minimum investment cannot exceed maximum investment",
      "INVALID_CONFIG",
    );
  }
  if (
    opportunity.startDate &&
    opportunity.endDate &&
    opportunity.startDate > opportunity.endDate
  ) {
    throw new ApiError(400, "Start date must be before end date", "INVALID_CONFIG");
  }
}

export async function upsertOpportunityForProject(
  projectId: string,
  input: OpportunityInput,
  adminId: string,
): Promise<IInvestmentOpportunityDocument> {
  assertObjectId(projectId, "project ID");
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found", "NOT_FOUND");
  }

  let opportunity = await InvestmentOpportunity.findOne({ project: projectId });

  if (!opportunity) {
    opportunity = await InvestmentOpportunity.create({
      project: projectId,
      status: OpportunityStatus.DRAFT,
      currency: input.currency,
      fundingTarget: input.fundingTarget ?? null,
      minimumInvestment: input.minimumInvestment ?? null,
      maximumInvestment: input.maximumInvestment ?? null,
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
      termsVersion: 1,
      committedAmountMinor: 0,
      createdBy: adminId,
    });
  } else {
    const materialChange =
      opportunity.currency !== input.currency ||
      JSON.stringify(opportunity.fundingTarget) !== JSON.stringify(input.fundingTarget ?? null) ||
      JSON.stringify(opportunity.minimumInvestment) !==
        JSON.stringify(input.minimumInvestment ?? null) ||
      JSON.stringify(opportunity.maximumInvestment) !==
        JSON.stringify(input.maximumInvestment ?? null);

    opportunity.currency = input.currency;
    opportunity.fundingTarget = input.fundingTarget ?? null;
    opportunity.minimumInvestment = input.minimumInvestment ?? null;
    opportunity.maximumInvestment = input.maximumInvestment ?? null;
    opportunity.startDate = input.startDate ?? null;
    opportunity.endDate = input.endDate ?? null;

    if (materialChange && opportunity.status !== OpportunityStatus.DRAFT) {
      opportunity.termsVersion += 1;
    }

    await opportunity.save();
  }

  await writeAuditLog({
    actorType: "USER",
    actorId: adminId,
    action: "opportunity.upserted",
    entityType: "InvestmentOpportunity",
    entityId: opportunity._id.toString(),
    metadata: { projectId, termsVersion: opportunity.termsVersion },
  });

  return opportunity;
}

async function transitionOpportunity(
  opportunity: IInvestmentOpportunityDocument,
  next: OpportunityStatusType,
  adminId: string,
): Promise<IInvestmentOpportunityDocument> {
  if (opportunity.status === next) {
    return opportunity;
  }
  if (!canTransitionOpportunityStatus(opportunity.status, next)) {
    throw new ApiError(
      400,
      `Cannot transition opportunity from ${opportunity.status} to ${next}`,
      "INVALID_TRANSITION",
    );
  }

  if (next === OpportunityStatus.OPEN) {
    const project = await Project.findById(opportunity.project);
    if (!project || project.status !== ProjectStatus.PUBLISHED) {
      throw new ApiError(
        400,
        "Project must be published before opening an investment opportunity",
        "PROJECT_NOT_PUBLISHED",
      );
    }
    assertOpenable(opportunity);
  }

  opportunity.status = next;
  await opportunity.save();

  await writeAuditLog({
    actorType: "USER",
    actorId: adminId,
    action: `opportunity.${next.toLowerCase()}`,
    entityType: "InvestmentOpportunity",
    entityId: opportunity._id.toString(),
  });

  return opportunity;
}

export async function openOpportunity(projectId: string, adminId: string) {
  const opportunity = await getOpportunityByProjectId(projectId);
  if (!opportunity) {
    throw new ApiError(404, "Configure investment terms before opening", "NOT_FOUND");
  }
  return transitionOpportunity(opportunity, OpportunityStatus.OPEN, adminId);
}

export async function pauseOpportunity(projectId: string, adminId: string) {
  const opportunity = await getOpportunityByProjectId(projectId);
  if (!opportunity) throw new ApiError(404, "Opportunity not found", "NOT_FOUND");
  return transitionOpportunity(opportunity, OpportunityStatus.PAUSED, adminId);
}

export async function closeOpportunity(projectId: string, adminId: string) {
  const opportunity = await getOpportunityByProjectId(projectId);
  if (!opportunity) throw new ApiError(404, "Opportunity not found", "NOT_FOUND");
  return transitionOpportunity(opportunity, OpportunityStatus.CLOSED, adminId);
}

export async function cancelOpportunity(projectId: string, adminId: string) {
  const opportunity = await getOpportunityByProjectId(projectId);
  if (!opportunity) throw new ApiError(404, "Opportunity not found", "NOT_FOUND");
  return transitionOpportunity(opportunity, OpportunityStatus.CANCELLED, adminId);
}

export function isOpportunityCurrentlyInvestable(
  opportunity: IInvestmentOpportunityDocument,
  now = new Date(),
): boolean {
  if (!canAcceptInvestments(opportunity.status)) return false;
  if (opportunity.startDate && now < opportunity.startDate) return false;
  if (opportunity.endDate && now > opportunity.endDate) return false;
  return true;
}

export function serializeOpportunity(opportunity: IInvestmentOpportunityDocument) {
  return {
    id: opportunity._id.toString(),
    projectId: opportunity.project.toString(),
    status: opportunity.status,
    currency: opportunity.currency,
    fundingTarget: opportunity.fundingTarget ?? null,
    minimumInvestment: opportunity.minimumInvestment ?? null,
    maximumInvestment: opportunity.maximumInvestment ?? null,
    startDate: opportunity.startDate,
    endDate: opportunity.endDate,
    termsVersion: opportunity.termsVersion,
    committedAmountMinor: opportunity.committedAmountMinor,
    createdAt: opportunity.createdAt,
    updatedAt: opportunity.updatedAt,
  };
}

export function serializePublicOpportunity(
  opportunity: IInvestmentOpportunityDocument | null,
) {
  if (!opportunity || !isOpportunityCurrentlyInvestable(opportunity)) {
    return null;
  }

  return {
    status: opportunity.status,
    currency: opportunity.currency,
    fundingTarget: opportunity.fundingTarget ?? null,
    minimumInvestment: opportunity.minimumInvestment ?? null,
    maximumInvestment: opportunity.maximumInvestment ?? null,
    startDate: opportunity.startDate,
    endDate: opportunity.endDate,
    termsVersion: opportunity.termsVersion,
    committedAmountMinor: opportunity.committedAmountMinor,
  };
}

export type PublicInvestmentCardSummary = {
  investable: boolean;
  opportunityStatus: OpportunityStatus | null;
  currency: string | null;
  committedAmountMinor: number;
  fundingTargetMinor: number | null;
  minimumInvestmentMinor: number | null;
};

/**
 * Batch-load opportunity summaries for public project cards (single query).
 */
export async function getInvestmentSummariesForProjects(
  projectIds: string[],
): Promise<Map<string, PublicInvestmentCardSummary>> {
  const map = new Map<string, PublicInvestmentCardSummary>();
  if (projectIds.length === 0) return map;

  const opportunities = await InvestmentOpportunity.find({
    project: { $in: projectIds.filter((id) => mongoose.Types.ObjectId.isValid(id)) },
  });

  for (const opportunity of opportunities) {
    const investable = isOpportunityCurrentlyInvestable(opportunity);
    map.set(opportunity.project.toString(), {
      investable,
      opportunityStatus: opportunity.status,
      currency: opportunity.currency,
      committedAmountMinor: opportunity.committedAmountMinor,
      fundingTargetMinor: opportunity.fundingTarget?.amountMinor ?? null,
      minimumInvestmentMinor: opportunity.minimumInvestment?.amountMinor ?? null,
    });
  }

  return map;
}

/**
 * Public detail summary — includes paused/closed visibility without implying investability.
 */
export function serializePublicOpportunityDetail(
  opportunity: IInvestmentOpportunityDocument | null,
) {
  if (!opportunity || opportunity.status === OpportunityStatus.DRAFT) {
    return null;
  }

  const investable = isOpportunityCurrentlyInvestable(opportunity);

  return {
    investable,
    status: opportunity.status,
    currency: opportunity.currency,
    fundingTarget: opportunity.fundingTarget ?? null,
    minimumInvestment: opportunity.minimumInvestment ?? null,
    maximumInvestment: opportunity.maximumInvestment ?? null,
    startDate: opportunity.startDate,
    endDate: opportunity.endDate,
    termsVersion: opportunity.termsVersion,
    committedAmountMinor: opportunity.committedAmountMinor,
  };
}
