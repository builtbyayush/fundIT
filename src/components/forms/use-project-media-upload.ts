"use client";

import { useCallback, useEffect, useState } from "react";

export interface ProjectMediaUploadResult {
  secureUrl: string;
  publicId: string;
  resourceType: string;
  width: number;
  height: number;
}

interface UploadResponse {
  success: boolean;
  data?: {
    configured?: boolean;
    uploads?: ProjectMediaUploadResult[];
  };
  error?: {
    message?: string;
    code?: string;
  };
}

export function useProjectMediaUpload(options: {
  projectId?: string;
  draftKey: string;
}) {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadStatus() {
      try {
        const response = await fetch("/api/admin/projects/media/upload");
        const payload = (await response.json()) as UploadResponse;
        if (!cancelled) {
          setConfigured(Boolean(payload.success && payload.data?.configured));
        }
      } catch {
        if (!cancelled) {
          setConfigured(false);
        }
      }
    }

    void loadStatus();
    return () => {
      cancelled = true;
    };
  }, []);

  const uploadFiles = useCallback(
    async (
      files: File[],
      mediaType: "cover" | "gallery",
      currentGalleryCount = 0,
    ): Promise<ProjectMediaUploadResult[]> => {
      if (files.length === 0) return [];
      setUploading(true);
      setProgress(0);
      setError(null);

      try {
        const formData = new FormData();
        for (const file of files) {
          formData.append("files", file);
        }
        formData.append("mediaType", mediaType);
        if (options.projectId) {
          formData.append("projectId", options.projectId);
        }
        formData.append("draftKey", options.draftKey);
        formData.append("currentGalleryCount", String(currentGalleryCount));

        const response = await fetch("/api/admin/projects/media/upload", {
          method: "POST",
          body: formData,
        });

        const payload = (await response.json()) as UploadResponse;
        if (!response.ok || !payload.success || !payload.data?.uploads) {
          throw new Error(payload.error?.message || "Image upload failed.");
        }

        setProgress(100);
        return payload.data.uploads;
      } catch (uploadError) {
        const message =
          uploadError instanceof Error
            ? uploadError.message
            : "Image upload failed. Please try again.";
        setError(message);
        throw uploadError;
      } finally {
        setUploading(false);
        setTimeout(() => setProgress(null), 600);
      }
    },
    [options.draftKey, options.projectId],
  );

  return {
    configured,
    uploading,
    progress,
    error,
    setError,
    uploadFiles,
  };
}
