import { Container } from "@/components/shared/section-heading";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectDetailLoading() {
  return (
    <Container className="py-8 sm:py-10 lg:py-12">
      <Skeleton className="mb-6 h-4 w-28" />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
        <div className="space-y-4">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-11 w-40" />
        </div>
        <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
      </div>
      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <div className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </Container>
  );
}
