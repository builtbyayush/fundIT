"use client";

import Image from "next/image";
import { useState } from "react";

import { ProjectMediaPlaceholder } from "@/components/project/project-media-placeholder";
import { cn } from "@/lib/utils/cn";

export interface ProjectImageProps {
  src: string;
  alt: string;
  title?: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  compactPlaceholder?: boolean;
}

export function ProjectImage({
  src,
  alt,
  title,
  priority = false,
  className,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 640px",
  fill = false,
  width,
  height,
  compactPlaceholder = false,
}: ProjectImageProps) {
  const [failed, setFailed] = useState(false);
  const unoptimized = src.startsWith("/") || src.endsWith(".svg");

  if (failed) {
    return (
      <ProjectMediaPlaceholder
        title={title}
        compact={compactPlaceholder}
        className={className}
      />
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        unoptimized={unoptimized}
        className={cn("object-cover", className)}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 1200}
      height={height ?? 675}
      priority={priority}
      sizes={sizes}
      unoptimized={unoptimized}
      className={cn("h-full w-full object-cover", className)}
      onError={() => setFailed(true)}
    />
  );
}
