"use client";

import { ImageOff, Link2, Upload } from "lucide-react";
import { useRef, useState } from "react";

import { AdminImageUrlPreview } from "@/components/forms/admin-image-url-preview";
import { useProjectMediaUpload } from "@/components/forms/use-project-media-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";

type CoverInputMode = "upload" | "url";

export function AdminCoverMediaField({
  initialValue = "",
  projectId,
  draftKey,
}: {
  initialValue?: string | null;
  projectId?: string;
  draftKey: string;
}) {
  const [coverImage, setCoverImage] = useState(initialValue ?? "");
  const [mode, setMode] = useState<CoverInputMode>("upload");
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { configured, uploading, progress, error, setError, uploadFiles } =
    useProjectMediaUpload({ projectId, draftKey });

  async function handleFilesSelected(files: FileList | File[] | null) {
    if (!files || files.length === 0) return;
    setLocalError(null);
    setError(null);

    try {
      const uploads = await uploadFiles([files[0]], "cover");
      if (uploads[0]?.secureUrl) {
        setCoverImage(uploads[0].secureUrl);
      }
    } catch (uploadError) {
      setLocalError(
        uploadError instanceof Error ? uploadError.message : "Cover upload failed.",
      );
    }
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Cover image</Label>
        <p className="text-xs text-muted-foreground">
          Primary visual used on project cards, the detail hero, and social previews.
        </p>
      </div>

      <AdminImageUrlPreview url={coverImage} alt="Cover image preview" className="max-w-xl" />

      <input type="hidden" name="coverImage" value={coverImage} />

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={mode === "upload" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("upload")}
        >
          <Upload className="mr-1 h-4 w-4" aria-hidden="true" />
          Upload image
        </Button>
        <Button
          type="button"
          variant={mode === "url" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("url")}
        >
          <Link2 className="mr-1 h-4 w-4" aria-hidden="true" />
          Use image URL
        </Button>
      </div>

      {mode === "upload" ? (
        <div className="space-y-3">
          {configured === false ? (
            <p className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
              Cloudinary uploads are not configured. Use image URL instead.
            </p>
          ) : null}

          <div
            className={cn(
              "rounded-lg border border-dashed bg-muted/20 px-4 py-8 text-center transition-colors",
              uploading ? "opacity-70" : "hover:border-primary/40",
            )}
            onDragOver={(event) => {
              event.preventDefault();
            }}
            onDrop={(event) => {
              event.preventDefault();
              void handleFilesSelected(event.dataTransfer.files);
            }}
          >
            <Upload className="mx-auto mb-2 h-6 w-6 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm font-medium">Drag and drop a cover image here</p>
            <p className="mt-1 text-xs text-muted-foreground">
              JPEG, PNG, WebP, or AVIF up to 10 MB
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              disabled={uploading || configured === false}
              onClick={openFilePicker}
            >
              {uploading ? "Uploading…" : "Choose file"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={(event) => void handleFilesSelected(event.target.files)}
            />
          </div>

          {typeof progress === "number" ? (
            <p className="text-xs text-muted-foreground">Upload progress: {progress}%</p>
          ) : null}
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="coverImageUrl">Cover image URL</Label>
          <Input
            id="coverImageUrl"
            type="url"
            value={coverImage}
            onChange={(event) => setCoverImage(event.target.value)}
            placeholder="https://example.com/project-cover.jpg"
          />
        </div>
      )}

      {localError || error ? (
        <p className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <ImageOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {localError || error}
        </p>
      ) : null}

      {coverImage && mode === "upload" && !uploading ? (
        <p className="text-xs text-secondary">Cover image ready to save.</p>
      ) : null}
    </div>
  );
}
