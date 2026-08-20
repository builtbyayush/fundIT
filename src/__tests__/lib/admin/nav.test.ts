import { describe, expect, it } from "vitest";

import { adminBreadcrumbs, isAdminNavActive } from "@/lib/admin/nav";

describe("isAdminNavActive", () => {
  it("matches dashboard exactly", () => {
    expect(isAdminNavActive("/admin", "/admin")).toBe(true);
    expect(isAdminNavActive("/admin/projects", "/admin")).toBe(false);
  });

  it("highlights Create project only on /admin/projects/new", () => {
    expect(isAdminNavActive("/admin/projects/new", "/admin/projects/new")).toBe(true);
    expect(isAdminNavActive("/admin/projects/new", "/admin/projects")).toBe(false);
    expect(isAdminNavActive("/admin/projects/abc/edit", "/admin/projects/new")).toBe(false);
  });

  it("highlights Projects for list and nested project routes except create", () => {
    expect(isAdminNavActive("/admin/projects", "/admin/projects")).toBe(true);
    expect(isAdminNavActive("/admin/projects/abc/edit", "/admin/projects")).toBe(true);
    expect(isAdminNavActive("/admin/projects/abc/investment", "/admin/projects")).toBe(true);
  });

  it("highlights Investments by prefix", () => {
    expect(isAdminNavActive("/admin/investments", "/admin/investments")).toBe(true);
  });
});

describe("adminBreadcrumbs", () => {
  it("builds path-derived crumbs", () => {
    expect(adminBreadcrumbs("/admin").map((crumb) => crumb.label)).toEqual([
      "Admin",
      "Dashboard",
    ]);
    expect(adminBreadcrumbs("/admin/projects/new").map((crumb) => crumb.label)).toEqual([
      "Admin",
      "Projects",
      "Create",
    ]);
    expect(adminBreadcrumbs("/admin/projects/abc/edit").map((crumb) => crumb.label)).toEqual([
      "Admin",
      "Projects",
      "Edit",
    ]);
  });
});
