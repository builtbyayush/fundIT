import mongoose, { type Document, type Model, Schema } from "mongoose";

import { slugify } from "@/lib/utils/slug";

export interface ICategory {
  name: string;
  slug: string;
  description: string;
  icon: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategoryDocument extends ICategory, Document {}

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export interface ICategoryModel extends Model<ICategoryDocument> {
  findBySlug(slug: string): Promise<ICategoryDocument | null>;
  findActive(): Promise<ICategoryDocument[]>;
  createCategory(input: CreateCategoryInput): Promise<ICategoryDocument>;
}

const categorySchema = new Schema<ICategoryDocument, ICategoryModel>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: [100, "Category name must be 100 characters or fewer"],
    },
    slug: {
      type: String,
      required: [true, "Category slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [120, "Category slug must be 120 characters or fewer"],
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "Description must be 500 characters or fewer"],
    },
    icon: {
      type: String,
      default: "folder",
      trim: true,
      maxlength: [50, "Icon must be 50 characters or fewer"],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  { timestamps: true },
);

categorySchema.index({ name: 1 }, { unique: true });

categorySchema.pre("validate", function ensureSlug(next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name);
  }
  if (this.slug) {
    this.slug = slugify(this.slug);
  }
  next();
});

categorySchema.statics.findBySlug = function findBySlug(slug: string) {
  return this.findOne({ slug: slugify(slug) });
};

categorySchema.statics.findActive = function findActive() {
  return this.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
};

categorySchema.statics.createCategory = async function createCategory(
  input: CreateCategoryInput,
) {
  return this.create({
    name: input.name.trim(),
    slug: slugify(input.slug ?? input.name),
    description: input.description?.trim() ?? "",
    icon: input.icon?.trim() ?? "folder",
    isActive: input.isActive ?? true,
    displayOrder: input.displayOrder ?? 0,
  });
};

export const Category =
  (mongoose.models.Category as ICategoryModel | undefined) ??
  mongoose.model<ICategoryDocument, ICategoryModel>("Category", categorySchema);
