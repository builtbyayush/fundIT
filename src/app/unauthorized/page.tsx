import Link from "next/link";

import { PageState } from "@/components/shared/page-state";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config";

export default function UnauthorizedPage() {
  return (
    <PageState
      title="Access denied"
      description="You do not have permission to view this page, or your account is not active."
    >
      <Button asChild>
        <Link href="/">Back to {siteConfig.name}</Link>
      </Button>
      <Button variant="outline" asChild>
        <Link href="/login">Investor sign in</Link>
      </Button>
    </PageState>
  );
}
