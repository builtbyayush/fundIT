import { Container } from "@/components/shared/section-heading";
import { Skeleton } from "@/components/ui/skeleton";

export default function InvestorProfileLoading() {
  return (
    <Container className="py-10 sm:py-12">
      <Skeleton className="mb-3 h-10 w-40" />
      <Skeleton className="mb-8 h-5 w-72" />
      <div className="max-w-2xl overflow-hidden rounded-2xl border border-border/60">
        <Skeleton className="h-32 rounded-none" />
        <div className="space-y-4 p-6">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-2/3" />
        </div>
      </div>
    </Container>
  );
}
