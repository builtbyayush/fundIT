import { Container } from "@/components/shared/section-heading";
import { Skeleton } from "@/components/ui/skeleton";

export default function InvestorDashboardLoading() {
  return (
    <Container className="py-10 sm:py-12">
      <div className="max-w-2xl space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-6 w-80" />
      </div>
      <Skeleton className="mt-10 h-40 w-full rounded-2xl" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-2xl border border-border/60">
            <Skeleton className="aspect-[4/3] rounded-none" />
            <div className="space-y-3 p-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}
