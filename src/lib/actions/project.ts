"use server";

import { revalidatePath } from "next/cache";

import { UserRole } from "@/constants/roles";
import { ApiError } from "@/lib/api/errors";
import { AuthError, requireRole } from "@/lib/auth/guards";
import { connectToDatabase } from "@/lib/db";
import { projectInputSchema } from "@/lib/validations/project";
import {
  archiveProject,
  createProject,
  publishProject,
  serializeAdminProject,
  unpublishProject,
  updateProject,
} from "@/services/project.service";

export type ProjectActionState = {
  error?: string;
  success?: boolean;
  projectId?: string;
};

function toActionError(error: unknown): ProjectActionState {
  if (error instanceof AuthError) {
    return { error: error.message };
  }
  if (error instanceof ApiError) {
    return { error: error.message };
  }
  console.error("[projectAction]", error);
  return { error: "Something went wrong. Please try again." };
}

function parseProjectForm(formData: FormData) {
  const tagsRaw = String(formData.get("tags") || "");
  const highlightsRaw = String(formData.get("highlights") || "");
  const categoryIds = formData
    .getAll("categoryIds")
    .map((value) => String(value).trim())
    .filter(Boolean);
  const galleryUrls = formData
    .getAll("galleryUrls")
    .map((value) => String(value).trim())
    .filter(Boolean);
  const coverImageRaw = String(formData.get("coverImage") || "").trim();

  return projectInputSchema.parse({
    title: formData.get("title"),
    slug: formData.get("slug") || undefined,
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    categoryIds,
    primaryCategoryId: formData.get("primaryCategoryId"),
    thumbnail: coverImageRaw || null,
    coverImage: coverImageRaw || null,
    gallery: galleryUrls,
    video: formData.get("video") || null,
    website: formData.get("website") || null,
    tags: tagsRaw
      ? tagsRaw
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [],
    highlights: highlightsRaw
      ? highlightsRaw
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
      : [],
    location: {
      city: String(formData.get("city") || ""),
      state: String(formData.get("state") || ""),
      country: String(formData.get("country") || ""),
    },
  });
}

export async function createProjectAction(
  _prev: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  try {
    const user = await requireRole(UserRole.ADMIN);
    await connectToDatabase();
    const input = parseProjectForm(formData);
    const project = await createProject(input, user.id);
    revalidatePath("/admin/projects");
    revalidatePath("/projects");
    return { success: true, projectId: project._id.toString() };
  } catch (error) {
    if (error && typeof error === "object" && "issues" in error) {
      const first = (error as { issues?: Array<{ message?: string }> }).issues?.[0];
      return { error: first?.message ?? "Invalid project data." };
    }
    return toActionError(error);
  }
}

export async function updateProjectAction(
  projectId: string,
  _prev: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  try {
    await requireRole(UserRole.ADMIN);
    await connectToDatabase();
    const input = parseProjectForm(formData);
    const project = await updateProject(projectId, input);
    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${projectId}/edit`);
    revalidatePath("/projects");
    revalidatePath(`/projects/${project.slug}`);
    return { success: true, projectId: project._id.toString() };
  } catch (error) {
    if (error && typeof error === "object" && "issues" in error) {
      const first = (error as { issues?: Array<{ message?: string }> }).issues?.[0];
      return { error: first?.message ?? "Invalid project data." };
    }
    return toActionError(error);
  }
}

export async function publishProjectAction(projectId: string): Promise<ProjectActionState> {
  try {
    await requireRole(UserRole.ADMIN);
    await connectToDatabase();
    const project = await publishProject(projectId);
    revalidatePath("/admin/projects");
    revalidatePath("/projects");
    revalidatePath(`/projects/${project.slug}`);
    return { success: true, projectId };
  } catch (error) {
    return toActionError(error);
  }
}

export async function unpublishProjectAction(projectId: string): Promise<ProjectActionState> {
  try {
    await requireRole(UserRole.ADMIN);
    await connectToDatabase();
    const project = await unpublishProject(projectId);
    revalidatePath("/admin/projects");
    revalidatePath("/projects");
    revalidatePath(`/projects/${project.slug}`);
    return { success: true, projectId };
  } catch (error) {
    return toActionError(error);
  }
}

export async function archiveProjectAction(projectId: string): Promise<ProjectActionState> {
  try {
    await requireRole(UserRole.ADMIN);
    await connectToDatabase();
    const project = await archiveProject(projectId);
    revalidatePath("/admin/projects");
    revalidatePath("/projects");
    revalidatePath(`/projects/${project.slug}`);
    return { success: true, projectId };
  } catch (error) {
    return toActionError(error);
  }
}

export async function getAdminProjectSerialized(projectId: string) {
  await requireRole(UserRole.ADMIN);
  await connectToDatabase();
  const { getProjectById } = await import("@/services/project.service");
  const project = await getProjectById(projectId);
  await project.populate(["categories", "primaryCategory", "createdBy"]);
  return serializeAdminProject(project);
}
