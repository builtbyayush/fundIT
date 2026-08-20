import Link from "next/link";

import { AdminAttentionList } from "@/components/admin/admin-attention-list";
import { AdminMetricStrip } from "@/components/admin/admin-metric-strip";
import { ProjectStatusBadge } from "@/components/project/project-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/money";
import { getAdminWorkspaceStats } from "@/lib/admin/workspace-stats";
import { connectToDatabase } from "@/lib/db";
import { investmentStatusLabel } from "@/lib/status-labels";
import { serializeAdminProject } from "@/services/project.service";
import { serializeInvestment } from "@/services/investment.service";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await connectToDatabase();
  const stats = await getAdminWorkspaceStats();
  const recentProjects = stats.recentProjects.map(serializeAdminProject);
  const recentInvestments = stats.recentInvestments.map(serializeInvestment);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            What needs attention
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Operational snapshot of projects, opportunities, and payments.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" asChild>
            <Link href="/admin/projects/new">New project</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href="/admin/projects">All projects</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href="/admin/investments">Investments</Link>
          </Button>
        </div>
      </div>

      <AdminMetricStrip
        draft={stats.projects.draft}
        published={stats.projects.published}
        unpublished={stats.projects.unpublished}
        archived={stats.projects.archived}
        openOpportunities={stats.openOpportunities}
        confirmedAmountMinor={stats.investments.confirmedAmountMinor}
        pendingPayments={stats.investments.pendingPayments}
      />

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Needs attention</h3>
        <AdminAttentionList items={stats.attention} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Recent projects</h3>
            <Link href="/admin/projects" className="text-xs text-muted-foreground hover:text-foreground">
              View all
            </Link>
          </div>
          {recentProjects.length === 0 ? (
            <p className="rounded-xl border border-border/80 bg-card px-4 py-6 text-sm text-muted-foreground">
              No projects yet.
            </p>
          ) : (
            <ul className="divide-y divide-border/80 rounded-xl border border-border/80 bg-card">
              {recentProjects.map((project) => (
                <li key={project.id}>
                  <Link
                    href={`/admin/projects/${project.id}/edit`}
                    className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/40"
                  >
                    <span>
                      <span className="block text-sm font-medium text-foreground">
                        {project.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Updated {formatDate(project.updatedAt)}
                      </span>
                    </span>
                    <ProjectStatusBadge status={project.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Recent investments</h3>
            <Link
              href="/admin/investments"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              View all
            </Link>
          </div>
          {recentInvestments.length === 0 ? (
            <p className="rounded-xl border border-border/80 bg-card px-4 py-6 text-sm text-muted-foreground">
              No investments yet.
            </p>
          ) : (
            <ul className="divide-y divide-border/80 rounded-xl border border-border/80 bg-card">
              {recentInvestments.map((item) => {
                const href =
                  "title" in item.project
                    ? `/admin/projects/${item.project.id}/investment`
                    : "/admin/investments";
                return (
                <li key={item.id}>
                  <Link
                    href={href}
                    className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/40"
                  >
                    <span>
                      <span className="block text-sm font-medium text-foreground">
                        {item.investmentNumber}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {"title" in item.project ? item.project.title : "Project"} ·{" "}
                        {formatMoney({
                          amountMinor: item.amountMinor,
                          currency: item.currency,
                        })}
                      </span>
                    </span>
                    <Badge variant="outline">{investmentStatusLabel(item.status)}</Badge>
                  </Link>
                </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
