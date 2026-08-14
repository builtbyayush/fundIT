export const ProjectStatus = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  UNPUBLISHED: "UNPUBLISHED",
  ARCHIVED: "ARCHIVED",
} as const;

export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];

export const PROJECT_STATUSES = Object.values(ProjectStatus);

export function isProjectStatus(value: unknown): value is ProjectStatus {
  return typeof value === "string" && PROJECT_STATUSES.includes(value as ProjectStatus);
}

/** Allowed status transitions for the project lifecycle. */
export const ALLOWED_STATUS_TRANSITIONS: Record<ProjectStatus, readonly ProjectStatus[]> = {
  [ProjectStatus.DRAFT]: [ProjectStatus.PUBLISHED, ProjectStatus.ARCHIVED],
  [ProjectStatus.PUBLISHED]: [ProjectStatus.UNPUBLISHED, ProjectStatus.ARCHIVED],
  [ProjectStatus.UNPUBLISHED]: [ProjectStatus.PUBLISHED, ProjectStatus.ARCHIVED],
  [ProjectStatus.ARCHIVED]: [],
};

export function canTransitionStatus(from: ProjectStatus, to: ProjectStatus): boolean {
  return ALLOWED_STATUS_TRANSITIONS[from].includes(to);
}
