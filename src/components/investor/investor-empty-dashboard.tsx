import Link from "next/link";
import { Compass } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export function InvestorEmptyDashboard() {
  return (
    <EmptyState
      icon={Compass}
      title="Your FundIt story starts here."
      description="Discover interesting ideas and back the ones you believe in."
      action={
        <Button size="lg" asChild>
          <Link href="/projects">Explore ideas</Link>
        </Button>
      }
      className="bg-pastel-mint/50"
    />
  );
}
