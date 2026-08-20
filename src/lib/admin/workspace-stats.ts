import { OpportunityStatus } from "@/constants/opportunity-status";
import { ProjectStatus } from "@/constants/project-status";
import { Project } from "@/models/Project";
import { InvestmentOpportunity } from "@/models/InvestmentOpportunity";
import {
  getAdminInvestmentStats,
  listAdminInvestments,
} from "@/services/investment.service";
import { listAdminProjects } from "@/services/project.service";

export type AdminAttentionItem = {
  id: string;
  title: string;
  reason: string;
  href: string;
};

export function publishedWithoutOpenOpportunity<T extends { id: string }>(
  published: T[],
  openProjectIds: string[],
): T[] {
  const open = new Set(openProjectIds);
  return published.filter((project) => !open.has(project.id));
}

export function buildAdminAttention(input: {
  drafts: { id: string; title: string }[];
  publishedWithoutOpen: { id: string; title: string }[];
  pendingPayments: number;
}): AdminAttentionItem[] {
  const items: AdminAttentionItem[] = [
    ...input.drafts.map((project) => ({
      id: project.id,
      title: project.title,
      reason: "Draft — not public yet",
      href: `/admin/projects/${project.id}/edit`,
    })),
    ...input.publishedWithoutOpen.slice(0, 8).map((project) => ({
      id: project.id,
      title: project.title,
      reason: "Published without an open opportunity",
      href: `/admin/projects/${project.id}/investment`,
    })),
  ];

  if (input.pendingPayments > 0) {
    items.push({
      id: "pending-payments",
      title: `${input.pendingPayments} pending payment${input.pendingPayments === 1 ? "" : "s"}`,
      reason: "Review investments awaiting payment",
      href: "/admin/investments",
    });
  }

  return items;
}

export async function getAdminWorkspaceStats() {
  const [
    draft,
    published,
    unpublished,
    archived,
    openOpportunities,
    investmentStats,
    recentProjectsResult,
    recentInvestmentsResult,
    draftDocs,
    publishedDocs,
    openProjectIds,
  ] = await Promise.all([
    Project.countDocuments({ status: ProjectStatus.DRAFT }),
    Project.countDocuments({ status: ProjectStatus.PUBLISHED }),
    Project.countDocuments({ status: ProjectStatus.UNPUBLISHED }),
    Project.countDocuments({ status: ProjectStatus.ARCHIVED }),
    InvestmentOpportunity.countDocuments({ status: OpportunityStatus.OPEN }),
    getAdminInvestmentStats(),
    listAdminProjects({
      page: 1,
      limit: 5,
      search: "",
      category: "",
      status: undefined,
    }),
    listAdminInvestments({ page: 1, limit: 5 }),
    Project.find({ status: ProjectStatus.DRAFT })
      .select("title")
      .sort({ updatedAt: -1 })
      .limit(8),
    Project.find({ status: ProjectStatus.PUBLISHED })
      .select("title")
      .sort({ updatedAt: -1 })
      .limit(40),
    InvestmentOpportunity.distinct("project", { status: OpportunityStatus.OPEN }),
  ]);

  const openIds = openProjectIds.map((id) => String(id));
  const publishedItems = publishedDocs.map((doc) => ({
    id: doc._id.toString(),
    title: doc.title,
  }));
  const missingOpen = publishedWithoutOpenOpportunity(publishedItems, openIds);
  const attention = buildAdminAttention({
    drafts: draftDocs.map((doc) => ({
      id: doc._id.toString(),
      title: doc.title,
    })),
    publishedWithoutOpen: missingOpen,
    pendingPayments: investmentStats.pendingPayments,
  });

  return {
    projects: {
      draft,
      published,
      unpublished,
      archived,
      total: draft + published + unpublished + archived,
    },
    openOpportunities,
    investments: investmentStats,
    recentProjects: recentProjectsResult.items,
    recentInvestments: recentInvestmentsResult.items,
    attention,
  };
}
