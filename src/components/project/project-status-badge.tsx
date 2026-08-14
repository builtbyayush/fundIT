import { ProjectStatus } from "@/constants/project-status";
import { Badge } from "@/components/ui/badge";

const statusVariant: Record<
  ProjectStatus,
  "default" | "secondary" | "accent" | "outline" | "muted"
> = {
  [ProjectStatus.DRAFT]: "muted",
  [ProjectStatus.PUBLISHED]: "secondary",
  [ProjectStatus.UNPUBLISHED]: "outline",
  [ProjectStatus.ARCHIVED]: "accent",
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return <Badge variant={statusVariant[status]}>{status}</Badge>;
}
