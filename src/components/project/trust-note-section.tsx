import Link from "next/link";

import { Container } from "@/components/shared/section-heading";

export function TrustNoteSection() {
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <div className="max-w-2xl rounded-2xl border border-border/60 bg-card px-6 py-8 shadow-card sm:px-8">
          <h2 className="font-display text-2xl text-foreground">Know what you&apos;re backing.</h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Before you participate, you can review the project story and any investment terms
            published for that opportunity. FundIt does not promise returns.
          </p>
          <Link
            href="/projects"
            className="mt-4 inline-flex text-sm font-medium text-primary motion-safe-transition hover:underline"
          >
            Browse published opportunities
          </Link>
        </div>
      </Container>
    </section>
  );
}
