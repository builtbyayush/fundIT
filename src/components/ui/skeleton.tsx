import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-pastel-lavender/70", className)}
      {...props}
    />
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
      <Skeleton className="aspect-[4/3] rounded-none bg-pastel-blue/80" />
      <div className="space-y-3 p-6">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
