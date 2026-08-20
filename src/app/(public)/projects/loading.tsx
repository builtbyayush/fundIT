import { Container } from "@/components/shared/section-heading";
import { ProjectCardSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function ProjectsLoading() {
  return (
    <Container className="py-10 sm:py-14">
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-6 w-full max-w-xl" />
      </div>
      <Skeleton className="mt-8 h-12 max-w-xl rounded-xl" />
      <div className="mt-6 flex gap-2 overflow-hidden">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-24 shrink-0 rounded-full" />
        ))}
      </div>
      <div className="mt-10 flex items-center justify-between border-t border-border/60 pt-8">
        <Skeleton className="h-7 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 rounded-full" />
          <Skeleton className="h-10 w-36 rounded-full" />
        </div>
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <ProjectCardSkeleton key={index} />
        ))}
      </div>
    </Container>
  );
}
