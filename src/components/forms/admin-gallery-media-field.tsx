"use client";

import { ArrowDown, ArrowUp, ImageOff, Plus, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";

import { AdminImageUrlPreview } from "@/components/forms/admin-image-url-preview";
import { useProjectMediaUpload } from "@/components/forms/use-project-media-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MAX_GALLERY_IMAGES } from "@/lib/media/constants";
import { cn } from "@/lib/utils/cn";

export function AdminGalleryMediaField({
  initialUrls = [],
  projectId,
  draftKey,
}: {
  initialUrls?: string[];
  projectId?: string;
  draftKey: string;
}) {
  const [urls, setUrls] = useState<string[]>(initialUrls.length > 0 ? initialUrls : []);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { configured, uploading, progress, error, setError, uploadFiles } =
    useProjectMediaUpload({ projectId, draftKey });

  function updateUrl(index: number, value: string) {
    setUrls((current) => current.map((url, i) => (i === index ? value : url)));
  }

  function addUrl() {
    if (urls.length >= MAX_GALLERY_IMAGES) return;
    setUrls((current) => [...current, ""]);
  }

  function removeUrl(index: number) {
    setUrls((current) => current.filter((_, i) => i !== index));
  }

  function moveUrl(index: number, direction: -1 | 1) {
    setUrls((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  async function handleFilesSelected(files: FileList | File[] | null) {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const remaining = MAX_GALLERY_IMAGES - urls.length;
    if (remaining <= 0) {
      setLocalError(`Gallery already has the maximum of ${MAX_GALLERY_IMAGES} images.`);
      return;
    }

    if (fileArray.length > remaining) {
      setLocalError(`You can upload at most ${remaining} more gallery image${remaining === 1 ? "" : "s"}.`);
      return;
    }

    setLocalError(null);
    setError(null);

    try {
      const uploads = await uploadFiles(fileArray, "gallery", urls.length);
      const nextUrls = uploads.map((upload) => upload.secureUrl).filter(Boolean);
      if (nextUrls.length > 0) {
        setUrls((current) => [...current, ...nextUrls]);
      }
    } catch (uploadError) {
      setLocalError(
        uploadError instanceof Error ? uploadError.message : "Gallery upload failed.",
      );
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Gallery</Label>
        <p className="text-xs text-muted-foreground">
          Supporting images shown on the project detail page. Up to {MAX_GALLERY_IMAGES} images.
        </p>
      </div>

      {urls.length === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
          No gallery images yet.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {urls.map((url, index) => (
            <div
              key={`gallery-${index}-${url}`}
              className="space-y-3 rounded-lg border bg-muted/20 p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">Image {index + 1}</p>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Move image ${index + 1} up`}
                    disabled={index === 0}
                    onClick={() => moveUrl(index, -1)}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Move image ${index + 1} down`}
                    disabled={index === urls.length - 1}
                    onClick={() => moveUrl(index, 1)}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove image ${index + 1}`}
                    onClick={() => removeUrl(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <AdminImageUrlPreview
                url={url}
                alt={`Gallery image ${index + 1} preview`}
                className="w-full"
              />

              <Input type="hidden" name="galleryUrls" value={url} readOnly />

              {!url || !url.startsWith("https://res.cloudinary.com/") ? (
                <Input
                  type="url"
                  value={url}
                  onChange={(event) => updateUrl(index, event.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              ) : (
                <p className="truncate text-xs text-muted-foreground">{url}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <div
        className={cn(
          "rounded-lg border border-dashed bg-muted/10 px-4 py-5",
          uploading ? "opacity-70" : undefined,
        )}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          void handleFilesSelected(event.dataTransfer.files);
        }}
      >
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading || configured === false || urls.length >= MAX_GALLERY_IMAGES}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-1 h-4 w-4" aria-hidden="true" />
            {uploading ? "Uploading…" : "Upload images"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addUrl}
            disabled={urls.length >= MAX_GALLERY_IMAGES}
          >
            <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
            Add image URL
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Drag and drop multiple images here. JPEG, PNG, WebP, or AVIF up to 10 MB each.
        </p>
        {configured === false ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Cloudinary uploads are not configured. Use image URL instead.
          </p>
        ) : null}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="hidden"
          onChange={(event) => void handleFilesSelected(event.target.files)}
        />
      </div>

      {typeof progress === "number" ? (
        <p className="text-xs text-muted-foreground">Upload progress: {progress}%</p>
      ) : null}

      {localError || error ? (
        <p className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <ImageOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {localError || error}
        </p>
      ) : null}
    </div>
  );
}
