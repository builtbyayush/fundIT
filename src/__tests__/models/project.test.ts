import mongoose from "mongoose";
import { describe, expect, it } from "vitest";

import { ProjectStatus } from "@/constants/project-status";
import { Project } from "@/models/Project";

describe("Project model", () => {
  const categoryA = new mongoose.Types.ObjectId();
  const categoryB = new mongoose.Types.ObjectId();

  const base = {
    title: "MedSense Clinical Assistant",
    shortDescription: "AI-assisted clinical documentation for hospitals.",
    description:
      "A longer description for the fictional MedSense opportunity used in tests.",
    categories: [categoryA, categoryB],
    primaryCategory: categoryA,
    createdBy: new mongoose.Types.ObjectId(),
  };

  it("accepts a valid project and defaults to DRAFT", async () => {
    const project = new Project(base);
    await project.validate();
    expect(project.status).toBe(ProjectStatus.DRAFT);
    expect(project.slug).toBe("medsense-clinical-assistant");
    expect(project.categories).toHaveLength(2);
  });

  it("rejects primary category outside categories", async () => {
    const project = new Project({
      ...base,
      primaryCategory: new mongoose.Types.ObjectId(),
    });
    await expect(project.validate()).rejects.toThrow(/primary/i);
  });

  it("rejects empty categories", async () => {
    const project = new Project({
      ...base,
      categories: [],
    });
    await expect(project.validate()).rejects.toThrow(/categor/i);
  });

  it("rejects invalid status values", async () => {
    const project = new Project({
      ...base,
      status: "LIVE",
    });
    await expect(project.validate()).rejects.toThrow(/status/i);
  });

  it("requires title, descriptions, categories, primary, and createdBy", async () => {
    const project = new Project({});
    await expect(project.validate()).rejects.toThrow();
  });

  it("enforces unique slug index", () => {
    expect(Project.schema.path("slug")?.options?.unique).toBe(true);
  });

  it("limits gallery and tags sizes", async () => {
    const project = new Project({
      ...base,
      gallery: Array.from({ length: 13 }, (_, i) => `https://example.com/${i}.jpg`),
    });
    await expect(project.validate()).rejects.toThrow(/gallery/i);
  });
});
