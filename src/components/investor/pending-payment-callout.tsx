import { ResumePaymentButton } from "@/components/investments/resume-payment-button";
import { cn } from "@/lib/utils";

export function PendingPaymentCallout({
  investmentId,
  className,
}: {
  investmentId: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-warning/30 bg-pastel-yellow p-5 text-pastel-yellow-foreground",
        className,
      )}
    >
      <p className="font-display text-lg">Your payment isn’t complete yet.</p>
      <p className="mt-1 text-sm">
        You can continue the development checkout without creating a duplicate investment.
      </p>
      <div className="mt-4">
        <ResumePaymentButton
          investmentId={investmentId}
          label="Continue payment"
        />
      </div>
    </div>
  );
}
