import type { UploadApiResponse } from "cloudinary";

import { ApiError } from "@/lib/api/errors";
import { getCloudinaryClient } from "@/lib/cloudinary/client";
import { isCloudinaryConfigured } from "@/lib/cloudinary/config";
import { getProjectMediaFolder, type ProjectMediaType } from "@/lib/media/folders";
import {
  validateImageUpload,
  type ValidatedImageUpload,
} from "@/lib/media/upload-validation";

export interface UploadedProjectMedia {
  secureUrl: string;
  publicId: string;
  resourceType: string;
  width: number;
  height: number;
}

export interface UploadProjectMediaOptions {
  file: File;
  mediaType: ProjectMediaType;
  projectId?: string | null;
  draftKey?: string | null;
}

function mapUploadResult(result: UploadApiResponse): UploadedProjectMedia {
  if (!result.secure_url || !result.public_id) {
    throw new ApiError(502, "Cloudinary upload did not return a valid image URL.", "UPLOAD_FAILED");
  }

  return {
    secureUrl: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type ?? "image",
    width: result.width ?? 0,
    height: result.height ?? 0,
  };
}

async function uploadValidatedImage(
  validated: ValidatedImageUpload,
  folder: string,
): Promise<UploadedProjectMedia> {
  const client = getCloudinaryClient();
  if (!client) {
    throw new ApiError(
      503,
      "Cloudinary uploads are not configured. Use image URL instead.",
      "CLOUDINARY_NOT_CONFIGURED",
    );
  }

  try {
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const upload = client.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          overwrite: false,
          unique_filename: true,
        },
        (error, uploadResult) => {
          if (error || !uploadResult) {
            reject(error ?? new Error("Cloudinary upload failed."));
            return;
          }
          resolve(uploadResult);
        },
      );

      upload.end(validated.buffer);
    });

    return mapUploadResult(result);
  } catch (error) {
    console.error("[media-upload]", error);
    throw new ApiError(
      502,
      "Image upload failed. Please try again or use an image URL.",
      "UPLOAD_FAILED",
    );
  }
}

export async function uploadProjectMedia(
  options: UploadProjectMediaOptions,
): Promise<UploadedProjectMedia> {
  if (!isCloudinaryConfigured()) {
    throw new ApiError(
      503,
      "Cloudinary uploads are not configured. Use image URL instead.",
      "CLOUDINARY_NOT_CONFIGURED",
    );
  }

  if (!options.projectId?.trim() && !options.draftKey?.trim()) {
    throw new ApiError(
      400,
      "A project ID or draft key is required for uploads.",
      "INVALID_UPLOAD_CONTEXT",
    );
  }

  const buffer = Buffer.from(await options.file.arrayBuffer());
  const validated = validateImageUpload(options.file, buffer);
  const folder = getProjectMediaFolder({
    projectId: options.projectId,
    draftKey: options.draftKey,
    mediaType: options.mediaType,
  });

  return uploadValidatedImage(validated, folder);
}

export async function uploadProjectMediaBatch(
  files: File[],
  options: Omit<UploadProjectMediaOptions, "file"> & {
    currentGalleryCount?: number;
    maxGalleryImages?: number;
  },
): Promise<UploadedProjectMedia[]> {
  const maxGalleryImages = options.maxGalleryImages ?? 12;
  const currentGalleryCount = options.currentGalleryCount ?? 0;

  if (options.mediaType === "gallery") {
    const remaining = maxGalleryImages - currentGalleryCount;
    if (remaining <= 0) {
      throw new ApiError(
        400,
        `Gallery already has the maximum of ${maxGalleryImages} images.`,
        "GALLERY_LIMIT_REACHED",
      );
    }

    if (files.length > remaining) {
      throw new ApiError(
        400,
        `You can upload at most ${remaining} more gallery image${remaining === 1 ? "" : "s"}.`,
        "GALLERY_LIMIT_EXCEEDED",
      );
    }
  } else if (files.length > 1) {
    throw new ApiError(400, "Only one cover image can be uploaded at a time.", "INVALID_FILE");
  }

  const uploads: UploadedProjectMedia[] = [];
  for (const file of files) {
    uploads.push(
      await uploadProjectMedia({
        file,
        mediaType: options.mediaType,
        projectId: options.projectId,
        draftKey: options.draftKey,
      }),
    );
  }

  return uploads;
}

export const mediaUploadInternals = {
  uploadValidatedImage,
  mapUploadResult,
};
