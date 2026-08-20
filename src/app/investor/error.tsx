"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Container } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";

export default function InvestorErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Container className="py-10 sm:py-12">
      <EmptyState
        icon={AlertCircle}
        title="We couldn’t load this page"
        description="Something went wrong while loading your FundIt account. Try again, or explore ideas instead."
        action={
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button onClick={reset}>Try again</Button>
            <Button variant="outline" asChild>
              <Link href="/projects">Explore ideas</Link>
            </Button>
          </div>
        }
      />
    </Container>
  );
}
