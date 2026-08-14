"use client";

import { ImageOff } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils/cn";

export function AdminImageUrlPreview({
  url,
  alt = "Image preview",
  className,
}: {
  url: string;
  alt?: string;
  className?: string;
}) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    url.trim() ? "loading" : "error",
  );

  const trimmed = url.trim();

  useEffect(() => {
    setStatus(trimmed ? "loading" : "error");
  }, [trimmed]);

  if (!trimmed) {
    return (
      <div
        className={cn(
          "flex aspect-[16/10] items-center justify-center rounded-lg border border-dashed bg-muted/40 text-xs text-muted-foreground",
          className,
        )}
      >
        Enter a URL to preview the image
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative aspect-[16/10] overflow-hidden rounded-lg border bg-muted/30",
        className,
      )}
    >
      {status === "error" ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-xs text-muted-foreground">
          <ImageOff className="h-5 w-5" aria-hidden="true" />
          <span>Preview unavailable. You can still save if the URL is valid.</span>
        </div>
      ) : null}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={trimmed}
        src={trimmed}
        alt={alt}
        className={cn(
          "h-full w-full object-cover",
          status === "loaded" ? "opacity-100" : "opacity-0",
        )}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
      />
    </div>
  );
}
