import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PageState } from "@/components/shared/page-state";
import { siteConfig } from "@/config";

export default function NotFoundPage() {
  return (
    <PageState
      title="Page not found"
      description="This page doesn't exist, or the opportunity may have moved. Explore what's live on FundIt instead."
    >
      <Button asChild>
        <Link href="/projects">Explore opportunities</Link>
      </Button>
      <Button variant="outline" asChild>
        <Link href="/">Back to {siteConfig.name}</Link>
      </Button>
    </PageState>
  );
}
