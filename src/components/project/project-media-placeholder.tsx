import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export function ProjectMediaPlaceholder({
  title,
  className,
  compact = false,
}: {
  title?: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-muted via-muted/70 to-secondary/10 text-muted-foreground",
        className,
      )}
      aria-hidden={title ? undefined : true}
    >
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 px-4 text-center",
          compact ? "py-6" : "py-10",
        )}
      >
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-background/70 text-secondary shadow-sm",
            compact ? "h-10 w-10" : "h-14 w-14",
          )}
        >
          <Sparkles
            className={cn(compact ? "h-5 w-5" : "h-7 w-7")}
            aria-hidden="true"
          />
        </div>
        <p className={cn("font-medium text-foreground/80", compact ? "text-xs" : "text-sm")}>
          {title ? `${title} preview` : "Opportunity preview"}
        </p>
        {!compact ? (
          <p className="max-w-xs text-xs text-muted-foreground">
            Visual preview will appear here when a cover image is available.
          </p>
        ) : null}
      </div>
    </div>
  );
}
