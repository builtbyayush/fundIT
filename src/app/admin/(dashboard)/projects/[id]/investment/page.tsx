import Link from "next/link";
import { notFound } from "next/navigation";

import { OpportunityForm } from "@/components/forms/opportunity-form";
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
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Admin / Projects / Investment
          </p>
          <h2 className="text-2xl font-bold tracking-tight">{project.title}</h2>
          <p className="text-muted-foreground">
            Configure investability separately from project publication.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/admin/projects/${id}/edit`}>Edit project</Link>
        </Button>
      </div>

      <OpportunityForm
        projectId={id}
        initial={opportunity ? serializeOpportunity(opportunity) : null}
      />
    </div>
  );
}
