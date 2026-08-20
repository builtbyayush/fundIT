import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectForm } from "@/components/forms/project-form";
import { ProjectStatusActions } from "@/components/project/project-status-actions";
import { ProjectStatusBadge } from "@/components/project/project-status-badge";
import { Button } from "@/components/ui/button";
import { ProjectStatus } from "@/constants/project-status";
import { connectToDatabase } from "@/lib/db";
import { listActiveCategories, serializeCategory } from "@/services/category.service";
import {
  getProjectById,
  serializeAdminProject,
} from "@/services/project.service";
import { getOpportunityByProjectId } from "@/services/opportunity.service";

export const dynamic = "force-dynamic";

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = await params;

  await connectToDatabase();

  let project;
  try {
    const doc = await getProjectById(id);
    await doc.populate(["categories", "primaryCategory", "createdBy"]);
    project = serializeAdminProject(doc);
  } catch {
    notFound();
  }

  const [categories, opportunity] = await Promise.all([
    listActiveCategories(),
    getOpportunityByProjectId(id),
  ]);
  const categoryOptions = categories.map(serializeCategory);
  const published = project.status === ProjectStatus.PUBLISHED;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{project.title}</h2>
          <div className="mt-2">
            <ProjectStatusBadge status={project.status} />
          </div>
          {published ? null : (
            <p className="mt-2 text-sm text-muted-foreground">
              Drafts and unpublished projects are not shown on the public catalog.
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <ProjectStatusActions projectId={project.id} status={project.status} />
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/projects/${project.id}/investment`}>Investment terms</Link>
            </Button>
            {published ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/projects/${project.slug}`} target="_blank" rel="noreferrer">
                  Preview
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border/80 bg-card px-4 py-3 text-sm">
        <p className="font-medium text-foreground">Next step</p>
        <p className="mt-1 text-muted-foreground">
          {opportunity
            ? "Review investment terms, then open the opportunity when the project is published."
            : "Set investment terms before this project can accept commitments."}
        </p>
        <Button size="sm" className="mt-3" variant="secondary" asChild>
          <Link href={`/admin/projects/${project.id}/investment`}>Set investment terms</Link>
        </Button>
      </div>

      <ProjectForm
        mode="edit"
        projectId={project.id}
        categories={categoryOptions.map((category) => ({
          id: category.id,
          name: category.name,
        }))}
        initialValues={{
          title: project.title,
          slug: project.slug,
          shortDescription: project.shortDescription,
          description: project.description,
          categoryIds: project.categoryIds,
          primaryCategoryId: project.primaryCategoryId,
          thumbnail: project.thumbnail,
          coverImage: project.coverImage,
          gallery: project.gallery,
          video: project.video,
          website: project.website,
          tags: project.tags,
          highlights: project.highlights,
          location: project.location,
        }}
      />
    </div>
  );
}
