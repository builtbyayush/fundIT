export type ExploreSort = "newest" | "updated";

export function exploreHref(params: {
  search?: string;
  category?: string;
  sort?: ExploreSort;
  page?: number;
}): string {
  const sp = new URLSearchParams();
  if (params.search) sp.set("search", params.search);
  if (params.category) sp.set("category", params.category);
  if (params.sort && params.sort !== "newest") sp.set("sort", params.sort);
  if (params.page && params.page > 1) sp.set("page", String(params.page));
  const query = sp.toString();
  return query ? `/projects?${query}` : "/projects";
}
