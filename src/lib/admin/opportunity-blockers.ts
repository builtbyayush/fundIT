import { ProjectStatus } from "@/constants/project-status";

export function opportunityOpenBlockers(input: {
  projectStatus: string;
  configured: boolean;
  fundingTargetMinor?: number | null;
  minimumMinor?: number | null;
  maximumMinor?: number | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
}): string[] {
  const blockers: string[] = [];

  if (!input.configured) {
    blockers.push("Save investment terms before opening this opportunity.");
  }

  if (input.projectStatus !== ProjectStatus.PUBLISHED) {
    blockers.push("Publish the project before opening an investment opportunity.");
  }

  if (input.fundingTargetMinor != null && input.fundingTargetMinor < 1) {
    blockers.push("Funding target must be a positive amount.");
  }

  if (
    input.minimumMinor != null &&
    input.maximumMinor != null &&
    input.minimumMinor > input.maximumMinor
  ) {
    blockers.push("Minimum investment cannot exceed maximum investment.");
  }

  if (
    input.startDate &&
    input.endDate &&
    new Date(input.startDate) > new Date(input.endDate)
  ) {
    blockers.push("Start date must be before end date.");
  }

  return blockers;
}
