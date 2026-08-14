import { ProjectCardSkeleton } from "@/components/ui/skeleton";
import { Container } from "@/components/shared/section-heading";

export default function ProjectsLoading() {
  return (
    <Container className="py-12 sm:py-16">
      <div className="space-y-3">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-8 w-72 animate-pulse rounded bg-muted" />
        <div className="h-4 w-full max-w-xl animate-pulse rounded bg-muted" />
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <ProjectCardSkeleton key={index} />
        ))}
      </div>
    </Container>
  );
}
