import { Container } from "@/components/shared/section-heading";

export default function InvestorInvestmentsLoading() {
  return (
    <Container className="py-10 sm:py-12">
      <div className="mb-8 space-y-3">
        <div className="h-8 w-56 animate-pulse rounded bg-muted" />
        <div className="h-4 w-80 animate-pulse rounded bg-muted" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-20 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </Container>
  );
}
