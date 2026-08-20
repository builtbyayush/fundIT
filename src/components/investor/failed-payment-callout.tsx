import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FailedPaymentCallout({
  projectSlug,
  className,
}: {
  projectSlug?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive",
        className,
      )}
    >
      <p className="font-display text-lg text-foreground">Your payment didn’t go through.</p>
      <p className="mt-1 text-muted-foreground">
        Nothing was confirmed. You can return to the project and back it again if it’s still
        open.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        {projectSlug ? (
          <>
            <Button asChild>
              <Link href={`/projects/${projectSlug}/invest`}>Try again</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/projects/${projectSlug}`}>View project</Link>
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}
