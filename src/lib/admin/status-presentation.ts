import { OpportunityStatus } from "@/constants/opportunity-status";
import { ProjectStatus } from "@/constants/project-status";
import { opportunityStatusLabel } from "@/lib/status-labels";

export type AdminBadgeVariant =
  | "pastelMint"
  | "pastelYellow"
  | "pastelPink"
  | "pastelBlue"
  | "pastelLavender"
  | "outline";

const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  [ProjectStatus.DRAFT]: "Draft",
  [ProjectStatus.PUBLISHED]: "Published",
  [ProjectStatus.UNPUBLISHED]: "Unpublished",
  [ProjectStatus.ARCHIVED]: "Archived",
};

const PROJECT_STATUS_BADGE: Record<ProjectStatus, AdminBadgeVariant> = {
  [ProjectStatus.DRAFT]: "pastelYellow",
  [ProjectStatus.PUBLISHED]: "pastelMint",
  [ProjectStatus.UNPUBLISHED]: "pastelBlue",
  [ProjectStatus.ARCHIVED]: "pastelLavender",
};

const OPPORTUNITY_STATUS_BADGE: Record<OpportunityStatus, AdminBadgeVariant> = {
  [OpportunityStatus.DRAFT]: "pastelYellow",
  [OpportunityStatus.OPEN]: "pastelMint",
  [OpportunityStatus.PAUSED]: "pastelBlue",
  [OpportunityStatus.CLOSED]: "pastelLavender",
  [OpportunityStatus.CANCELLED]: "pastelPink",
};

export function projectStatusLabel(status: string): string {
  return PROJECT_STATUS_LABELS[status as ProjectStatus] ?? status;
}

export function projectStatusBadgeVariant(status: string): AdminBadgeVariant {
  return PROJECT_STATUS_BADGE[status as ProjectStatus] ?? "outline";
}

export function opportunityStatusBadgeVariant(status: string): AdminBadgeVariant {
  return OPPORTUNITY_STATUS_BADGE[status as OpportunityStatus] ?? "outline";
}

export { opportunityStatusLabel };
