import mongoose, { type FilterQuery } from "mongoose";

import {
  canTransitionStatus,
  ProjectStatus,
  type ProjectStatus as ProjectStatusType,
} from "@/constants/project-status";
import { ApiError } from "@/lib/api/errors";
import {
  ensureCategoriesExist,
  getCategoryBySlug,
} from "@/services/category.service";
import {
  Project,
  type IProjectDocument,
  type IProjectLocation,
} from "@/models/Project";
import { slugify } from "@/lib/utils/slug";
import type {
  AdminProjectListQuery,
  ProjectInput,
  PublicProjectListQuery,
} from "@/lib/validations/project";

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type AdminProjectListItem = IProjectDocument;
export type PublicProjectListItem = IProjectDocument;

type PopulatedCategory = {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  icon?: string;
};

type PopulatedCreator = {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
};

async function generateUniqueSlug(base: string, excludeId?: string): Promise<string> {
  const normalized = slugify(base);
  if (!normalized) {
    throw new ApiError(400, "Unable to generate a valid slug from the title", "INVALID_SLUG");
  }

  let candidate = normalized;
  let suffix = 2;

  while (true) {
    const existing = await Project.findOne({
      slug: candidate,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    }).select("_id");

    if (!existing) {
      return candidate;
    }

    candidate = `${normalized}-${suffix}`;
    suffix += 1;
  }
}

function normalizeStringArray(values: string[] | undefined): string[] {
  if (!values) return [];
  return values.map((value) => value.trim()).filter(Boolean);
}

function normalizeLocation(location: ProjectInput["location"]): IProjectLocation | null {
  if (!location) return null;
  return location;
}

function serializeCategoryRef(
  category: PopulatedCategory | mongoose.Types.ObjectId | string | null | undefined,
) {
  if (!category) return null;
  if (typeof category === "object" && "name" in category) {
    return {
      id: category._id.toString(),
      name: category.name,
      slug: category.slug,
      icon: category.icon,
    };
  }
  return {
    id: String(category),
    name: "",
    slug: "",
    icon: undefined as string | undefined,
  };
}

function serializeCategories(
  categories: Array<PopulatedCategory | mongoose.Types.ObjectId | string> | undefined,
) {
  if (!categories?.length) return [];
  return categories
    .map((category) => serializeCategoryRef(category))
    .filter((category): category is NonNullable<typeof category> => Boolean(category));
}

async function resolveCategoryFilterId(
  categoryQuery: string,
): Promise<mongoose.Types.ObjectId | null> {
  if (mongoose.Types.ObjectId.isValid(categoryQuery)) {
    return new mongoose.Types.ObjectId(categoryQuery);
  }
  const category = await getCategoryBySlug(categoryQuery);
  if (!category) return null;
  return category._id as mongoose.Types.ObjectId;
}

export async function createProject(
  input: ProjectInput,
  createdById: string,
): Promise<IProjectDocument> {
  await ensureCategoriesExist(input.categoryIds);

  const slug = await generateUniqueSlug(input.slug || input.title);

  try {
    const project = await Project.create({
      title: input.title.trim(),
      slug,
      shortDescription: input.shortDescription.trim(),
      description: input.description.trim(),
      categories: input.categoryIds,
      primaryCategory: input.primaryCategoryId,
      status: ProjectStatus.DRAFT,
      thumbnail: input.thumbnail,
      coverImage: input.coverImage,
      gallery: normalizeStringArray(input.gallery),
      video: input.video,
      website: input.website,
      tags: normalizeStringArray(input.tags),
      highlights: normalizeStringArray(input.highlights),
      location: normalizeLocation(input.location),
      createdBy: createdById,
      publishedAt: null,
    });

    return project;
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      throw new ApiError(409, "A project with this slug already exists", "DUPLICATE_SLUG");
    }
    throw error;
  }
}

export async function getProjectById(id: string): Promise<IProjectDocument> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid project ID", "INVALID_ID");
  }

  const project = await Project.findById(id);
  if (!project) {
    throw new ApiError(404, "Project not found", "NOT_FOUND");
  }
  return project;
}

export async function getProjectBySlug(slug: string): Promise<IProjectDocument | null> {
  return (await Project.findBySlug(slug).exec()) as IProjectDocument | null;
}

export async function getPublishedProjectBySlug(slug: string) {
  return Project.findOne({
    slug: slugify(slug),
    status: ProjectStatus.PUBLISHED,
  })
    .populate("categories", "name slug icon")
    .populate("primaryCategory", "name slug icon")
    .lean()
    .exec();
}

export async function updateProject(
  id: string,
  input: ProjectInput,
): Promise<IProjectDocument> {
  const project = await getProjectById(id);
  await ensureCategoriesExist(input.categoryIds);

  project.title = input.title.trim();
  project.shortDescription = input.shortDescription.trim();
  project.description = input.description.trim();
  project.categories = input.categoryIds.map(
    (categoryId) => new mongoose.Types.ObjectId(categoryId),
  );
  project.primaryCategory = new mongoose.Types.ObjectId(input.primaryCategoryId);
  project.thumbnail = input.thumbnail;
  project.coverImage = input.coverImage;
  project.gallery = normalizeStringArray(input.gallery);
  project.video = input.video;
  project.website = input.website;
  project.tags = normalizeStringArray(input.tags);
  project.highlights = normalizeStringArray(input.highlights);
  project.location = normalizeLocation(input.location);

  // Only change slug when explicitly provided and different — never auto-rewrite published URLs from title edits
  if (input.slug && slugify(input.slug) !== project.slug) {
    project.slug = await generateUniqueSlug(input.slug, project._id.toString());
  }

  try {
    await project.save();
    return project;
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      throw new ApiError(409, "A project with this slug already exists", "DUPLICATE_SLUG");
    }
    throw error;
  }
}

async function transitionProjectStatus(
  id: string,
  nextStatus: ProjectStatusType,
): Promise<IProjectDocument> {
  const project = await getProjectById(id);

  if (project.status === nextStatus) {
    return project;
  }

  if (!canTransitionStatus(project.status, nextStatus)) {
    throw new ApiError(
      400,
      `Cannot transition project from ${project.status} to ${nextStatus}`,
      "INVALID_TRANSITION",
    );
  }

  project.status = nextStatus;

  if (nextStatus === ProjectStatus.PUBLISHED && !project.publishedAt) {
    project.publishedAt = new Date();
  }

  await project.save();
  return project;
}

export async function publishProject(id: string): Promise<IProjectDocument> {
  return transitionProjectStatus(id, ProjectStatus.PUBLISHED);
}

export async function unpublishProject(id: string): Promise<IProjectDocument> {
  return transitionProjectStatus(id, ProjectStatus.UNPUBLISHED);
}

export async function archiveProject(id: string): Promise<IProjectDocument> {
  return transitionProjectStatus(id, ProjectStatus.ARCHIVED);
}

export async function listAdminProjects(
  query: AdminProjectListQuery,
): Promise<PaginatedResult<IProjectDocument>> {
  const filter: FilterQuery<IProjectDocument> = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.category) {
    const categoryId = await resolveCategoryFilterId(query.category);
    if (!categoryId) {
      return {
        items: [],
        page: query.page,
        limit: query.limit,
        total: 0,
        totalPages: 0,
      };
    }
    filter.categories = categoryId;
  }

  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: "i" } },
      { shortDescription: { $regex: query.search, $options: "i" } },
      { tags: { $regex: query.search, $options: "i" } },
    ];
  }

  const skip = (query.page - 1) * query.limit;
  const [items, total] = await Promise.all([
    Project.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(query.limit)
      .populate("categories", "name slug icon")
      .populate("primaryCategory", "name slug icon")
      .populate("createdBy", "name email"),
    Project.countDocuments(filter),
  ]);

  return {
    items: items as unknown as IProjectDocument[],
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.ceil(total / query.limit) || 0,
  };
}

export async function listPublishedProjects(
  query: PublicProjectListQuery,
): Promise<PaginatedResult<IProjectDocument>> {
  const filter: FilterQuery<IProjectDocument> = {
    status: ProjectStatus.PUBLISHED,
  };

  if (query.category) {
    const category = await getCategoryBySlug(query.category);
    if (!category || !category.isActive) {
      return {
        items: [],
        page: query.page,
        limit: query.limit,
        total: 0,
        totalPages: 0,
      };
    }
    filter.categories = category._id;
  }

  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: "i" } },
      { shortDescription: { $regex: query.search, $options: "i" } },
      { description: { $regex: query.search, $options: "i" } },
      { tags: { $regex: query.search, $options: "i" } },
    ];
  }

  const skip = (query.page - 1) * query.limit;
  const sort: Record<string, 1 | -1> =
    query.sort === "updated"
      ? { updatedAt: -1, createdAt: -1 }
      : { publishedAt: -1, createdAt: -1 };

  const [items, total] = await Promise.all([
    Project.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(query.limit)
      .populate("categories", "name slug icon")
      .populate("primaryCategory", "name slug icon"),
    Project.countDocuments(filter),
  ]);

  return {
    items: items as unknown as IProjectDocument[],
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.ceil(total / query.limit) || 0,
  };
}

export function serializeAdminProject(project: IProjectDocument) {
  const categories = serializeCategories(
    project.categories as unknown as Array<PopulatedCategory | mongoose.Types.ObjectId>,
  );
  const primaryCategory = serializeCategoryRef(
    project.primaryCategory as unknown as PopulatedCategory | mongoose.Types.ObjectId,
  );
  const createdBy = project.createdBy as unknown as PopulatedCreator | mongoose.Types.ObjectId;

  return {
    id: project._id.toString(),
    title: project.title,
    slug: project.slug,
    shortDescription: project.shortDescription,
    description: project.description,
    status: project.status,
    thumbnail: project.thumbnail,
    coverImage: project.coverImage,
    gallery: project.gallery,
    video: project.video,
    website: project.website,
    tags: project.tags,
    highlights: project.highlights,
    location: project.location ?? null,
    publishedAt: project.publishedAt,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    categories,
    primaryCategory: primaryCategory ?? { id: "", name: "", slug: "" },
    categoryIds: categories.map((category) => category.id),
    primaryCategoryId: primaryCategory?.id ?? "",
    createdBy:
      createdBy && typeof createdBy === "object" && "email" in createdBy
        ? {
            id: createdBy._id.toString(),
            name: createdBy.name,
            email: createdBy.email,
          }
        : { id: String(createdBy), name: "", email: "" },
  };
}

export function serializePublicProject(project: IProjectDocument | Record<string, unknown>) {
  const doc = project as IProjectDocument & {
    categories?: Array<PopulatedCategory | mongoose.Types.ObjectId>;
    primaryCategory?: PopulatedCategory | mongoose.Types.ObjectId;
  };

  const categories = serializeCategories(doc.categories);
  const primaryCategory = serializeCategoryRef(doc.primaryCategory);

  // Prefer primary first for display ordering
  const orderedCategories =
    primaryCategory && categories.some((category) => category.id === primaryCategory.id)
      ? [
          primaryCategory,
          ...categories.filter((category) => category.id !== primaryCategory.id),
        ]
      : categories;

  return {
    id: String(doc._id),
    title: doc.title,
    slug: doc.slug,
    shortDescription: doc.shortDescription,
    description: doc.description,
    thumbnail: doc.thumbnail,
    coverImage: doc.coverImage,
    gallery: doc.gallery ?? [],
    video: doc.video,
    website: doc.website,
    tags: doc.tags ?? [],
    highlights: doc.highlights ?? [],
    location: doc.location ?? null,
    publishedAt: doc.publishedAt,
    categories: orderedCategories,
    primaryCategory,
  };
}
