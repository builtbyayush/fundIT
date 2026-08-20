export function isAdminNavActive(pathname: string, href: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin";
  }
  if (href === "/admin/projects/new") {
    return pathname === "/admin/projects/new";
  }
  if (href === "/admin/projects") {
    if (pathname === "/admin/projects/new") return false;
    return pathname === "/admin/projects" || pathname.startsWith("/admin/projects/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export type AdminBreadcrumb = {
  label: string;
  href?: string;
};

export function adminBreadcrumbs(pathname: string): AdminBreadcrumb[] {
  const crumbs: AdminBreadcrumb[] = [{ label: "Admin", href: "/admin" }];

  if (pathname === "/admin") {
    crumbs.push({ label: "Dashboard" });
    return crumbs;
  }

  if (pathname === "/admin/projects/new") {
    crumbs.push({ label: "Projects", href: "/admin/projects" });
    crumbs.push({ label: "Create" });
    return crumbs;
  }

  if (pathname.startsWith("/admin/projects/") && pathname.endsWith("/edit")) {
    crumbs.push({ label: "Projects", href: "/admin/projects" });
    crumbs.push({ label: "Edit" });
    return crumbs;
  }

  if (pathname.startsWith("/admin/projects/") && pathname.endsWith("/investment")) {
    crumbs.push({ label: "Projects", href: "/admin/projects" });
    crumbs.push({ label: "Investment terms" });
    return crumbs;
  }

  if (pathname === "/admin/projects" || pathname.startsWith("/admin/projects/")) {
    crumbs.push({ label: "Projects" });
    return crumbs;
  }

  if (pathname === "/admin/investments" || pathname.startsWith("/admin/investments/")) {
    crumbs.push({ label: "Investments" });
    return crumbs;
  }

  return crumbs;
}
