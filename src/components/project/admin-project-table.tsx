import Link from "next/link";

import { ProjectStatusActions } from "@/components/project/project-status-actions";
import { ProjectStatusBadge } from "@/components/project/project-status-badge";
import { Button } from "@/components/ui/button";
import { ProjectStatus } from "@/constants/project-status";

export interface AdminProjectRow {
  id: string;
  title: string;
  status: ProjectStatus;
  createdAt: Date | string;
  publishedAt?: Date | string | null;
  primaryCategory: { name: string };
  extraCategoryCount?: number;
  createdBy: { name: string };
}

function formatDate(value?: Date | string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function AdminProjectTable({ projects }: { projects: AdminProjectRow[] }) {
  if (projects.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-10 text-center">
        <h3 className="text-lg font-semibold">No projects have been created yet.</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Create your first opportunity to start building the FundIt catalog.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/admin/projects/new">Create project</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b bg-muted/40 text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Created</th>
            <th className="px-4 py-3 font-medium">Published</th>
            <th className="px-4 py-3 font-medium">Created by</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id} className="border-b last:border-0">
              <td className="px-4 py-3 font-medium text-foreground">{project.title}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {project.primaryCategory.name || "—"}
                {project.extraCategoryCount && project.extraCategoryCount > 0
                  ? ` +${project.extraCategoryCount}`
                  : ""}
              </td>
              <td className="px-4 py-3">
                <ProjectStatusBadge status={project.status} />
              </td>
              <td className="px-4 py-3 text-muted-foreground">{formatDate(project.createdAt)}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {formatDate(project.publishedAt)}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {project.createdBy.name || "—"}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/admin/projects/${project.id}/edit`}>Edit</Link>
                  </Button>
                  <ProjectStatusActions projectId={project.id} status={project.status} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
