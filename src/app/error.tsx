"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PageState } from "@/components/shared/page-state";
import { siteConfig } from "@/config";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageState
      title="Something went wrong"
      description="We couldn't load this page. Try again, or head back to explore ideas on FundIt."
    >
      <Button onClick={reset}>Try again</Button>
      <Button variant="outline" asChild>
        <Link href="/">Back to {siteConfig.name}</Link>
      </Button>
    </PageState>
  );
}
