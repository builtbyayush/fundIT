"use client";

import { useCallback, useId, useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

import { ProjectImage } from "@/components/project/project-image";
import { ProjectMediaPlaceholder } from "@/components/project/project-media-placeholder";
import { Button } from "@/components/ui/button";
import type { ProjectMediaItem } from "@/lib/project/media";
import { cn } from "@/lib/utils";

interface ProjectMediaGalleryProps {
  title: string;
  items: ProjectMediaItem[];
}

export function ProjectMediaGallery({ title, items }: ProjectMediaGalleryProps) {
  const [index, setIndex] = useState(0);
  const [youtubePlaying, setYoutubePlaying] = useState(false);
  const labelId = useId();
  const current = items[index];
  const showStrip = items.length > 1;

  const go = useCallback(
    (next: number) => {
      if (items.length === 0) return;
      setYoutubePlaying(false);
      setIndex((next + items.length) % items.length);
    },
    [items.length],
  );

  if (items.length === 0) {
    return (
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border/60 bg-pastel-blue/50 shadow-card">
        <ProjectMediaPlaceholder title={title} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border/60 bg-pastel-blue/50 shadow-elevated outline-none"
        role="region"
        aria-labelledby={labelId}
        tabIndex={showStrip ? 0 : undefined}
        onKeyDown={(event) => {
          if (!showStrip) return;
          if (event.key === "ArrowRight") {
            event.preventDefault();
            go(index + 1);
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            go(index - 1);
          }
        }}
      >
        <p id={labelId} className="sr-only">
          {title} media
        </p>
        {current.kind === "image" ? (
          <ProjectImage
            src={current.src}
            alt={current.alt}
            title={title}
            fill
            priority={index === 0}
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover motion-safe-transition"
          />
        ) : youtubePlaying ? (
          <iframe
            src={current.embedUrl}
            title={`${title} video`}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className="flex h-full w-full flex-col items-center justify-center gap-3 bg-pastel-lavender text-pastel-lavender-foreground motion-safe-transition hover:bg-pastel-lavender/80"
            onClick={() => setYoutubePlaying(true)}
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-elevated">
              <Play className="h-7 w-7 translate-x-0.5" aria-hidden="true" />
            </span>
            <span className="text-sm font-semibold">Play video</span>
          </button>
        )}

        {showStrip ? (
          <>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute left-3 top-1/2 -translate-y-1/2 shadow-soft"
              aria-label="Previous media"
              onClick={() => go(index - 1)}
            >
              <ChevronLeft />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2 shadow-soft"
              aria-label="Next media"
              onClick={() => go(index + 1)}
            >
              <ChevronRight />
            </Button>
          </>
        ) : null}
      </div>

      {showStrip ? (
        <>
          <div className="hidden gap-2 overflow-x-auto pb-1 sm:flex">
            {items.map((item, itemIndex) => {
              const selected = itemIndex === index;
              return (
                <button
                  key={item.kind === "image" ? item.src : item.id}
                  type="button"
                  onClick={() => {
                    setYoutubePlaying(false);
                    setIndex(itemIndex);
                  }}
                  aria-label={
                    item.kind === "youtube"
                      ? `Play ${title} video`
                      : `Show image ${itemIndex + 1}`
                  }
                  aria-current={selected ? "true" : undefined}
                  className={cn(
                    "relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border motion-safe-transition",
                    selected ? "border-primary ring-2 ring-primary/30" : "border-border/60",
                  )}
                >
                  {item.kind === "image" ? (
                    <ProjectImage
                      src={item.src}
                      alt=""
                      title={title}
                      fill
                      sizes="96px"
                      compactPlaceholder
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-pastel-lavender text-primary">
                      <Play className="h-5 w-5" aria-hidden="true" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 sm:hidden">
            {items.map((item, itemIndex) => {
              const selected = itemIndex === index;
              return (
                <button
                  key={item.kind === "image" ? `${item.src}-mobile` : `${item.id}-mobile`}
                  type="button"
                  onClick={() => {
                    setYoutubePlaying(false);
                    setIndex(itemIndex);
                  }}
                  aria-label={
                    item.kind === "youtube"
                      ? `Play ${title} video`
                      : `Show image ${itemIndex + 1}`
                  }
                  aria-current={selected ? "true" : undefined}
                  className={cn(
                    "relative h-14 w-20 shrink-0 snap-start overflow-hidden rounded-xl border",
                    selected ? "border-primary ring-2 ring-primary/30" : "border-border/60",
                  )}
                >
                  {item.kind === "image" ? (
                    <ProjectImage
                      src={item.src}
                      alt=""
                      title={title}
                      fill
                      sizes="80px"
                      compactPlaceholder
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-pastel-lavender text-primary">
                      <Play className="h-5 w-5" aria-hidden="true" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex justify-center gap-1.5 sm:hidden" aria-hidden="true">
            {items.map((item, itemIndex) => (
              <span
                key={item.kind === "image" ? `${item.src}-dot` : `${item.id}-dot`}
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  itemIndex === index ? "bg-primary" : "bg-border",
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
