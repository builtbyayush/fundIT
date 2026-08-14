import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectForm } from "@/components/forms/project-form";
import { ProjectStatusActions } from "@/components/project/project-status-actions";
import { ProjectStatusBadge } from "@/components/project/project-status-badge";
import { Button } from "@/components/ui/button";
import { connectToDatabase } from "@/lib/db";
import { listActiveCategories, serializeCategory } from "@/services/category.service";
import {
  getProjectById,
  serializeAdminProject,
} from "@/services/project.service";

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

  const categories = (await listActiveCategories()).map(serializeCategory);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Admin / Projects / Edit
          </p>
          <h2 className="text-2xl font-bold tracking-tight">{project.title}</h2>
          <div className="mt-2">
            <ProjectStatusBadge status={project.status} />
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <ProjectStatusActions projectId={project.id} status={project.status} />
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/projects/${project.id}/investment`}>Investment terms</Link>
          </Button>
        </div>
      </div>

      <ProjectForm
        mode="edit"
        projectId={project.id}
        categories={categories.map((category) => ({
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
