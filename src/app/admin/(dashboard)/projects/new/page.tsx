import { ProjectForm } from "@/components/forms/project-form";
import { connectToDatabase } from "@/lib/db";
import { listActiveCategories, serializeCategory } from "@/services/category.service";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  await connectToDatabase();
  const categories = (await listActiveCategories()).map(serializeCategory);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Create project</h2>
        <p className="text-sm text-muted-foreground">
          New projects start as drafts and stay private until you publish them.
        </p>
      </div>
      <ProjectForm
        mode="create"
        categories={categories.map((category) => ({
          id: category.id,
          name: category.name,
        }))}
      />
    </div>
  );
}
