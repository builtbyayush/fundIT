import { ProjectForm } from "@/components/forms/project-form";
import { connectToDatabase } from "@/lib/db";
import { listActiveCategories, serializeCategory } from "@/services/category.service";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  await connectToDatabase();
  const categories = (await listActiveCategories()).map(serializeCategory);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Admin / Projects / New
        </p>
        <h2 className="text-2xl font-bold tracking-tight">Create project</h2>
        <p className="text-muted-foreground">
          New projects start as drafts and remain private until published.
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
