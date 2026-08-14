import mongoose, { type Document, type Model, Schema, type Types } from "mongoose";

import { ProjectStatus } from "@/constants/project-status";
import { slugify } from "@/lib/utils/slug";

export const MAX_PROJECT_CATEGORIES = 8;

export interface IProjectLocation {
  city?: string;
  state?: string;
  country?: string;
}

export interface IProject {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  categories: Types.ObjectId[];
  primaryCategory: Types.ObjectId;
  status: ProjectStatus;
  thumbnail?: string | null;
  coverImage?: string | null;
  gallery: string[];
  video?: string | null;
  location?: IProjectLocation | null;
  website?: string | null;
  tags: string[];
  highlights: string[];
  createdBy: Types.ObjectId;
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProjectDocument extends IProject, Document {}

export interface IProjectModel extends Model<IProjectDocument> {
  findBySlug(slug: string): ReturnType<Model<IProjectDocument>["findOne"]>;
  findPublishedBySlug(slug: string): ReturnType<Model<IProjectDocument>["findOne"]>;
}

const locationSchema = new Schema<IProjectLocation>(
  {
    city: { type: String, trim: true, maxlength: 100 },
    state: { type: String, trim: true, maxlength: 100 },
    country: { type: String, trim: true, maxlength: 100 },
  },
  { _id: false },
);

const projectSchema = new Schema<IProjectDocument, IProjectModel>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [120, "Title must be 120 characters or fewer"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [120, "Slug must be 120 characters or fewer"],
    },
    shortDescription: {
      type: String,
      required: [true, "Short description is required"],
      trim: true,
      maxlength: [280, "Short description must be 280 characters or fewer"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [20000, "Description must be 20000 characters or fewer"],
    },
    categories: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Category",
        },
      ],
      required: [true, "At least one category is required"],
      validate: [
        {
          validator: (value: Types.ObjectId[]) =>
            Array.isArray(value) && value.length >= 1 && value.length <= MAX_PROJECT_CATEGORIES,
          message: `A project must have between 1 and ${MAX_PROJECT_CATEGORIES} categories`,
        },
        {
          validator: (value: Types.ObjectId[]) => {
            const ids = value.map((id) => String(id));
            return new Set(ids).size === ids.length;
          },
          message: "Duplicate categories are not allowed",
        },
      ],
    },
    primaryCategory: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Primary category is required"],
    },
    status: {
      type: String,
      enum: {
        values: Object.values(ProjectStatus),
        message: "Invalid project status",
      },
      required: true,
      default: ProjectStatus.DRAFT,
      index: true,
    },
    thumbnail: { type: String, default: null, trim: true },
    coverImage: { type: String, default: null, trim: true },
    gallery: {
      type: [String],
      default: [],
      validate: {
        validator: (value: string[]) => value.length <= 12,
        message: "Gallery can contain at most 12 images",
      },
    },
    video: { type: String, default: null, trim: true },
    location: { type: locationSchema, default: null },
    website: { type: String, default: null, trim: true },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (value: string[]) => value.length <= 20,
        message: "A project can have at most 20 tags",
      },
    },
    highlights: {
      type: [String],
      default: [],
      validate: {
        validator: (value: string[]) => value.length <= 12,
        message: "A project can have at most 12 highlights",
      },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    publishedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true },
);

projectSchema.index({ categories: 1 });
projectSchema.index({ primaryCategory: 1 });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ status: 1, publishedAt: -1 });
projectSchema.index({ title: "text", shortDescription: "text", description: "text", tags: "text" });

projectSchema.pre("validate", function ensureSlugAndPrimary(next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title);
  }
  if (this.slug) {
    this.slug = slugify(this.slug);
  }

  if (this.categories?.length && this.primaryCategory) {
    const primary = String(this.primaryCategory);
    const belongs = this.categories.some((id) => String(id) === primary);
    if (!belongs) {
      this.invalidate(
        "primaryCategory",
        "Primary category must be one of the selected categories",
      );
    }
  }

  next();
});

projectSchema.statics.findBySlug = function findBySlug(slug: string) {
  return this.findOne({ slug: slugify(slug) });
};

projectSchema.statics.findPublishedBySlug = function findPublishedBySlug(slug: string) {
  return this.findOne({
    slug: slugify(slug),
    status: ProjectStatus.PUBLISHED,
  });
};

export const Project =
  (mongoose.models.Project as IProjectModel | undefined) ??
  mongoose.model<IProjectDocument, IProjectModel>("Project", projectSchema);
