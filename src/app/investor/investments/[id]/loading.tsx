import { Container } from "@/components/shared/section-heading";
import { Skeleton } from "@/components/ui/skeleton";

export default function InvestorInvestmentDetailLoading() {
  return (
    <Container className="py-10 sm:py-12">
      <Skeleton className="mb-6 h-8 w-48" />
      <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-border/60">
        <Skeleton className="aspect-[16/10] rounded-none sm:aspect-[21/9]" />
        <div className="space-y-3 p-6">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-8 w-40" />
        </div>
      </div>
      <Skeleton className="mx-auto mt-6 h-40 max-w-3xl rounded-2xl" />
    </Container>
  );
}
