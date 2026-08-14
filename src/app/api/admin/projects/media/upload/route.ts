import { NextResponse } from "next/server";

import { UserRole } from "@/constants/roles";
import { AuthError, requireRole } from "@/lib/auth/guards";
import { errorResponse, handleApiError, successResponse } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";
import { isCloudinaryConfigured } from "@/lib/cloudinary/config";
import { MAX_GALLERY_IMAGES } from "@/lib/media/constants";
import type { ProjectMediaType } from "@/lib/media/folders";
import { uploadProjectMediaBatch } from "@/services/media-upload.service";

export async function GET() {
  try {
    await requireRole(UserRole.ADMIN);
    return NextResponse.json(
      successResponse({
        configured: isCloudinaryConfigured(),
      }),
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(errorResponse(error.message, error.code), {
        status: error.statusCode,
      });
    }
    return NextResponse.json(handleApiError(error), { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(UserRole.ADMIN);

    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        errorResponse(
          "Cloudinary uploads are not configured. Use image URL instead.",
          "CLOUDINARY_NOT_CONFIGURED",
        ),
        { status: 503 },
      );
    }

    const formData = await request.formData();
    const mediaType = String(formData.get("mediaType") || "").trim() as ProjectMediaType;
    const projectId = String(formData.get("projectId") || "").trim() || null;
    const draftKey = String(formData.get("draftKey") || "").trim() || null;
    const currentGalleryCount = Number(formData.get("currentGalleryCount") || 0);

    if (mediaType !== "cover" && mediaType !== "gallery") {
      throw new ApiError(400, "Invalid media type.", "INVALID_MEDIA_TYPE");
    }

    const files = [
      ...formData.getAll("files"),
      ...formData.getAll("file"),
    ].filter((entry): entry is File => entry instanceof File);

    if (files.length === 0) {
      throw new ApiError(400, "At least one image file is required.", "INVALID_FILE");
    }

    const uploads = await uploadProjectMediaBatch(files, {
      mediaType,
      projectId,
      draftKey,
      currentGalleryCount: Number.isFinite(currentGalleryCount) ? currentGalleryCount : 0,
      maxGalleryImages: MAX_GALLERY_IMAGES,
    });

    return NextResponse.json(successResponse({ uploads }));
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(errorResponse(error.message, error.code), {
        status: error.statusCode,
      });
    }

    if (error instanceof ApiError) {
      return NextResponse.json(errorResponse(error.message, error.code), {
        status: error.statusCode,
      });
    }

    const apiError = handleApiError(error);
    return NextResponse.json(apiError, { status: 400 });
  }
}
