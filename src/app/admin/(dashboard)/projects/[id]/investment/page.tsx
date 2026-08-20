import Link from "next/link";
import { notFound } from "next/navigation";

import { OpportunityForm } from "@/components/forms/opportunity-form";
import { ProjectStatusBadge } from "@/components/project/project-status-badge";
import { Button } from "@/components/ui/button";
import { connectToDatabase } from "@/lib/db";
import { getProjectById } from "@/services/project.service";
import {
  getOpportunityByProjectId,
  serializeOpportunity,
} from "@/services/opportunity.service";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectInvestmentPage({ params }: PageProps) {
  const { id } = await params;
  await connectToDatabase();

  let project;
  try {
    project = await getProjectById(id);
  } catch {
    notFound();
  }

  const opportunity = await getOpportunityByProjectId(id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Button variant="ghost" size="sm" className="-ml-2 mb-2" asChild>
            <Link href={`/admin/projects/${id}/edit`}>Back to project</Link>
          </Button>
          <h2 className="text-xl font-semibold tracking-tight">{project.title}</h2>
          <div className="mt-2">
            <ProjectStatusBadge status={project.status} />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Investment terms are configured separately from project publication.
          </p>
        </div>
      </div>

      <OpportunityForm
        projectId={id}
        projectStatus={project.status}
        initial={opportunity ? serializeOpportunity(opportunity) : null}
      />
    </div>
  );
}
