"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  completeMockPaymentAction,
  type ActionState,
} from "@/lib/actions/investment";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Processing…" : label}
    </Button>
  );
}

export function MockCheckoutForm({
  investmentId,
  providerOrderId,
}: {
  investmentId: string;
  providerOrderId: string;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState(completeMockPaymentAction, {} as ActionState);

  useEffect(() => {
    if (state.success && state.redirectUrl) {
      router.push(state.redirectUrl);
    }
  }, [state, router]);

  return (
    <div className="space-y-4">
      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <form action={formAction} className="space-y-3">
        <input type="hidden" name="investmentId" value={investmentId} />
        <input type="hidden" name="providerOrderId" value={providerOrderId} />
        <input type="hidden" name="outcome" value="success" />
        <SubmitButton label="Simulate successful payment" />
      </form>

      <form action={formAction}>
        <input type="hidden" name="investmentId" value={investmentId} />
        <input type="hidden" name="providerOrderId" value={providerOrderId} />
        <input type="hidden" name="outcome" value="failure" />
        <Button type="submit" variant="outline" className="w-full">
          Simulate failed payment
        </Button>
      </form>

          <p className="text-xs text-muted-foreground">
            Development payment simulation only. This is not Razorpay or any live
            gateway. It records success or failure for local testing.
          </p>
    </div>
  );
}
