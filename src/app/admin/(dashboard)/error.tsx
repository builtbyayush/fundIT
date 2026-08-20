"use client";

import { AlertCircle } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function AdminDashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <EmptyState
      icon={AlertCircle}
      className="shadow-none"
      title="Couldn’t load this admin page"
      description="Try again. If the problem continues, check the database connection and reload."
      action={<Button onClick={reset}>Try again</Button>}
    />
  );
}
