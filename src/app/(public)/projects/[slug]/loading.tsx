import { Container } from "@/components/shared/section-heading";

export default function ProjectDetailLoading() {
  return (
    <Container className="py-10 sm:py-14">
      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-4">
          <div className="h-5 w-24 animate-pulse rounded bg-muted" />
          <div className="h-10 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-20 w-full animate-pulse rounded bg-muted" />
        </div>
        <div className="h-72 animate-pulse rounded-xl bg-muted" />
      </div>
    </Container>
  );
}
