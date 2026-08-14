import Link from "next/link";

import { AdminProjectTable } from "@/components/project/admin-project-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PROJECT_STATUSES } from "@/constants/project-status";
import { connectToDatabase } from "@/lib/db";
import { adminProjectListQuerySchema } from "@/lib/validations/project";
import { listActiveCategories, serializeCategory } from "@/services/category.service";
import {
  listAdminProjects,
  serializeAdminProject,
} from "@/services/project.service";

export const dynamic = "force-dynamic";

interface AdminProjectsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminProjectsPage({ searchParams }: AdminProjectsPageProps) {
  const params = await searchParams;
  const query = adminProjectListQuerySchema.parse({
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    search: typeof params.search === "string" ? params.search : "",
    category: typeof params.category === "string" ? params.category : "",
    status: typeof params.status === "string" ? params.status : "",
  });

  await connectToDatabase();
  const [result, categories] = await Promise.all([
    listAdminProjects(query),
    listActiveCategories(),
  ]);

  const projects = result.items.map((item) => serializeAdminProject(item));
  const categoryOptions = categories.map(serializeCategory);

  const buildHref = (page: number) => {
    const sp = new URLSearchParams();
    sp.set("page", String(page));
    if (query.search) sp.set("search", query.search);
    if (query.category) sp.set("category", query.category);
    if (query.status) sp.set("status", query.status);
    return `/admin/projects?${sp.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Admin / Projects
          </p>
          <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground">
            Create, publish, and manage investment opportunities.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/projects/new">New project</Link>
        </Button>
      </div>

      <form className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-4">
        <Input
          name="search"
          placeholder="Search by title"
          defaultValue={query.search}
          aria-label="Search projects"
        />
        <Select name="category" defaultValue={query.category || ""} aria-label="Filter by category">
          <option value="">All categories</option>
          {categoryOptions.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
        <Select name="status" defaultValue={query.status || ""} aria-label="Filter by status">
          <option value="">All statuses</option>
          {PROJECT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </Select>
        <Button type="submit" variant="secondary">
          Apply filters
        </Button>
      </form>

      <AdminProjectTable
        projects={projects.map((project) => ({
          id: project.id,
          title: project.title,
          status: project.status,
          createdAt: project.createdAt,
          publishedAt: project.publishedAt,
          primaryCategory: {
            name: project.primaryCategory.name || project.categories[0]?.name || "",
          },
          extraCategoryCount: Math.max(project.categories.length - 1, 0),
          createdBy: { name: project.createdBy.name },
        }))}
      />

      {result.totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Page {result.page} of {result.totalPages} · {result.total} total
          </p>
          <div className="flex gap-2">
            {result.page > 1 ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={buildHref(result.page - 1)}>Previous</Link>
              </Button>
            ) : null}
            {result.page < result.totalPages ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={buildHref(result.page + 1)}>Next</Link>
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
