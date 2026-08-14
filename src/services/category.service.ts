import mongoose from "mongoose";

import { ApiError } from "@/lib/api/errors";
import { Category, type ICategoryDocument } from "@/models/Category";
import { Project } from "@/models/Project";
import { slugify } from "@/lib/utils/slug";
import type { CategoryInput } from "@/lib/validations/category";

export async function listActiveCategories(): Promise<ICategoryDocument[]> {
  return Category.findActive();
}

export async function listAllCategories(): Promise<ICategoryDocument[]> {
  return Category.find().sort({ displayOrder: 1, name: 1 });
}

export async function getCategoryById(id: string): Promise<ICategoryDocument> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid category ID", "INVALID_ID");
  }

  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, "Category not found", "NOT_FOUND");
  }
  return category;
}

export async function getCategoryBySlug(slug: string): Promise<ICategoryDocument | null> {
  return Category.findBySlug(slug);
}

export async function ensureCategoryExists(id: string): Promise<ICategoryDocument> {
  const category = await getCategoryById(id);
  if (!category.isActive) {
    throw new ApiError(400, "Selected category is inactive", "INACTIVE_CATEGORY");
  }
  return category;
}

export async function ensureCategoriesExist(
  ids: string[],
): Promise<ICategoryDocument[]> {
  const uniqueIds = Array.from(new Set(ids));
  if (uniqueIds.length === 0) {
    throw new ApiError(400, "Select at least one category", "INVALID_CATEGORIES");
  }

  const categories = await Promise.all(uniqueIds.map((id) => ensureCategoryExists(id)));
  return categories;
}

export async function createCategory(input: CategoryInput): Promise<ICategoryDocument> {
  const slug = slugify(input.slug || input.name);

  const existing = await Category.findOne({
    $or: [{ slug }, { name: input.name.trim() }],
  });
  if (existing) {
    throw new ApiError(409, "A category with this name or slug already exists", "DUPLICATE");
  }

  try {
    return await Category.createCategory({
      name: input.name,
      slug,
      description: input.description,
      icon: input.icon,
      isActive: input.isActive,
      displayOrder: input.displayOrder,
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      throw new ApiError(409, "A category with this name or slug already exists", "DUPLICATE");
    }
    throw error;
  }
}

export async function deactivateCategory(id: string): Promise<ICategoryDocument> {
  const category = await getCategoryById(id);
  const projectCount = await Project.countDocuments({ categories: category._id });
  if (projectCount > 0 && !category.isActive) {
    return category;
  }

  category.isActive = false;
  await category.save();
  return category;
}

export function serializeCategory(category: ICategoryDocument) {
  return {
    id: category._id.toString(),
    name: category.name,
    slug: category.slug,
    description: category.description,
    icon: category.icon,
    isActive: category.isActive,
    displayOrder: category.displayOrder,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}
