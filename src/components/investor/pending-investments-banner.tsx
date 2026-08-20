import Link from "next/link";

import { ResumePaymentButton } from "@/components/investments/resume-payment-button";
import { Button } from "@/components/ui/button";
import { investmentsListHref } from "@/lib/investor/investment-card";

export function PendingInvestmentsBanner({
  count,
  firstPendingId,
}: {
  count: number;
  firstPendingId?: string;
}) {
  if (count < 1) return null;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-warning/30 bg-pastel-yellow p-5 text-pastel-yellow-foreground sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold">
          {count === 1
            ? "You have a payment waiting."
            : `You have ${count} payments waiting.`}
        </p>
        <p className="mt-1 text-sm">Finish checkout to confirm your backing.</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        {firstPendingId ? (
          <ResumePaymentButton investmentId={firstPendingId} label="Continue payment" />
        ) : null}
        <Button variant="outline" asChild>
          <Link href={investmentsListHref({ status: "pending" })}>View pending</Link>
        </Button>
      </div>
    </div>
  );
}
