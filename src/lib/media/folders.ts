export type ProjectMediaType = "cover" | "gallery";

export function getProjectMediaFolder(options: {
  projectId?: string | null;
  draftKey?: string | null;
  mediaType: ProjectMediaType;
}): string {
  const base = options.projectId?.trim()
    ? `fundit/projects/${options.projectId.trim()}`
    : `fundit/projects/drafts/${options.draftKey?.trim() || "unspecified"}`;

  return `${base}/${options.mediaType}`;
}
