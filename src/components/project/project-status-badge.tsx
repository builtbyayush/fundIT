import { ProjectStatus } from "@/constants/project-status";
import { Badge } from "@/components/ui/badge";
import {
  projectStatusBadgeVariant,
  projectStatusLabel,
} from "@/lib/admin/status-presentation";

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <Badge variant={projectStatusBadgeVariant(status)}>{projectStatusLabel(status)}</Badge>
  );
}
