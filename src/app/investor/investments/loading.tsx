import { Container } from "@/components/shared/section-heading";
import { Skeleton } from "@/components/ui/skeleton";

export default function InvestorInvestmentsLoading() {
  return (
    <Container className="py-10 sm:py-12">
      <div className="mb-8 space-y-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-80" />
      </div>
      <div className="mb-8 flex gap-2">
        <Skeleton className="h-10 w-16 rounded-full" />
        <Skeleton className="h-10 w-28 rounded-full" />
        <Skeleton className="h-10 w-36 rounded-full" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-2xl border border-border/60">
            <Skeleton className="aspect-[4/3] rounded-none" />
            <div className="space-y-3 p-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}
