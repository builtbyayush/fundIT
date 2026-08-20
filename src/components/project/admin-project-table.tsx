import Link from "next/link";
import { FolderPlus, Search } from "lucide-react";

import { ProjectStatusActions } from "@/components/project/project-status-actions";
import { ProjectStatusBadge } from "@/components/project/project-status-badge";
import { FundingProgressBar } from "@/components/project/funding-progress";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectStatus } from "@/constants/project-status";
import type { CurrencyCode } from "@/constants/currency";
import {
  opportunityStatusBadgeVariant,
  opportunityStatusLabel,
} from "@/lib/admin/status-presentation";

export interface AdminProjectRow {
  id: string;
  title: string;
  slug: string;
  status: ProjectStatus;
  updatedAt: Date | string;
  categories: { name: string }[];
  primaryCategory: { name: string };
  opportunityStatus: string | null;
  committedAmountMinor: number;
  fundingTargetMinor: number | null;
  currency: string | null;
}

function formatDate(value?: Date | string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function CategoryChips({ project }: { project: AdminProjectRow }) {
  const primary = project.primaryCategory.name || project.categories[0]?.name;
  const extras = project.categories.filter((category) => category.name !== primary);

  if (!primary) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      <Badge variant="pastelLavender">{primary}</Badge>
      {extras.map((category) => (
        <Badge key={category.name} variant="outline">
          {category.name}
        </Badge>
      ))}
    </div>
  );
}

function OpportunityBadge({ status }: { status: string | null }) {
  if (!status) {
    return <span className="text-xs text-muted-foreground">Not configured</span>;
  }
  return (
    <Badge variant={opportunityStatusBadgeVariant(status)}>
      {opportunityStatusLabel(status)}
    </Badge>
  );
}

function FundingCell({ project }: { project: AdminProjectRow }) {
  if (!project.fundingTargetMinor) {
    return <span className="text-xs text-muted-foreground">No target</span>;
  }
  return (
    <FundingProgressBar
      compact
      committedMinor={project.committedAmountMinor}
      targetMinor={project.fundingTargetMinor}
      currency={(project.currency as CurrencyCode) || "INR"}
    />
  );
}

function RowActions({ project }: { project: AdminProjectRow }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" asChild>
        <Link href={`/admin/projects/${project.id}/edit`}>Edit</Link>
      </Button>
      <Button size="sm" variant="outline" asChild>
        <Link href={`/admin/projects/${project.id}/investment`}>Investment terms</Link>
      </Button>
      {project.status === ProjectStatus.PUBLISHED ? (
        <Button size="sm" variant="ghost" asChild>
          <Link href={`/projects/${project.slug}`} target="_blank" rel="noreferrer">
            Preview
          </Link>
        </Button>
      ) : null}
      <ProjectStatusActions projectId={project.id} status={project.status} />
    </div>
  );
}

export function AdminProjectTable({
  projects,
  filtered,
}: {
  projects: AdminProjectRow[];
  filtered: boolean;
}) {
  if (projects.length === 0) {
    if (filtered) {
      return (
        <EmptyState
          icon={Search}
          className="shadow-none"
          title="No projects match these filters"
          description="Clear search or status filters to see more of the catalog."
        />
      );
    }
    return (
      <EmptyState
        icon={FolderPlus}
        className="shadow-none"
        title="No projects have been created yet."
        description="Create a draft to start the catalog. Drafts stay private until published."
        action={
          <Button asChild>
            <Link href="/admin/projects/new">Create project</Link>
          </Button>
        }
      />
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-xl border border-border/80 bg-card lg:block">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border/80 bg-muted/40 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Categories</th>
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Opportunity</th>
              <th className="px-4 py-3 font-medium">Funding</th>
              <th className="px-4 py-3 font-medium">Updated</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-b border-border/80 last:border-0">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/projects/${project.id}/edit`}
                    className="font-medium text-foreground hover:underline"
                  >
                    {project.title}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <CategoryChips project={project} />
                </td>
                <td className="px-4 py-3">
                  <ProjectStatusBadge status={project.status} />
                </td>
                <td className="px-4 py-3">
                  <OpportunityBadge status={project.opportunityStatus} />
                </td>
                <td className="min-w-[8rem] px-4 py-3">
                  <FundingCell project={project} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(project.updatedAt)}
                </td>
                <td className="px-4 py-3">
                  <RowActions project={project} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 lg:hidden">
        {projects.map((project) => (
          <li key={project.id} className="rounded-xl border border-border/80 bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <Link
                href={`/admin/projects/${project.id}/edit`}
                className="font-medium text-foreground hover:underline"
              >
                {project.title}
              </Link>
              <ProjectStatusBadge status={project.status} />
            </div>
            <div className="mt-3 space-y-2 text-sm">
              <CategoryChips project={project} />
              <div className="flex items-center justify-between gap-2">
                <OpportunityBadge status={project.opportunityStatus} />
                <span className="text-xs text-muted-foreground">
                  Updated {formatDate(project.updatedAt)}
                </span>
              </div>
              <FundingCell project={project} />
            </div>
            <div className="mt-4">
              <RowActions project={project} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
