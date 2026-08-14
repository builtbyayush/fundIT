"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createInvestmentAction, type ActionState } from "@/lib/actions/investment";
import { formatMoney, parseMajorToMinor } from "@/lib/money";
import type { CurrencyCode } from "@/constants/currency";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Processing…" : label}
    </Button>
  );
}

export function InvestForm({
  projectId,
  projectTitle,
  currency,
  termsVersion,
  minimumInvestment,
  maximumInvestment,
  fundingTargetMinor,
  committedAmountMinor,
}: {
  projectId: string;
  projectTitle: string;
  currency: CurrencyCode;
  termsVersion: number;
  minimumInvestment?: { amountMinor: number; currency: CurrencyCode } | null;
  maximumInvestment?: { amountMinor: number; currency: CurrencyCode } | null;
  fundingTargetMinor?: number | null;
  committedAmountMinor?: number;
}) {
  const router = useRouter();
  const [step, setStep] = useState<"amount" | "review">("amount");
  const [amountMajor, setAmountMajor] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [state, formAction] = useActionState(createInvestmentAction, {} as ActionState);

  useEffect(() => {
    if (state.success && state.redirectUrl) {
      router.push(state.redirectUrl);
    }
  }, [state, router]);

  const remainingMinor =
    fundingTargetMinor != null
      ? Math.max(fundingTargetMinor - (committedAmountMinor ?? 0), 0)
      : null;

  const parsedMinor = useMemo(() => {
    try {
      if (!amountMajor.trim()) return null;
      return parseMajorToMinor(amountMajor, currency);
    } catch {
      return null;
    }
  }, [amountMajor, currency]);

  function goToReview(event: React.FormEvent) {
    event.preventDefault();
    setLocalError(null);
    try {
      const minor = parseMajorToMinor(amountMajor, currency);
      if (minimumInvestment && minor < minimumInvestment.amountMinor) {
        setLocalError("Amount is below the minimum investment.");
        return;
      }
      if (maximumInvestment && minor > maximumInvestment.amountMinor) {
        setLocalError("Amount exceeds the maximum investment.");
        return;
      }
      if (remainingMinor != null && minor > remainingMinor) {
        setLocalError("Amount exceeds remaining funding capacity.");
        return;
      }
      setStep("review");
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : "Enter a valid amount.");
    }
  }

  if (step === "review" && parsedMinor != null) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border bg-muted/30 p-4 text-sm">
          <h3 className="font-semibold text-foreground">Review your investment</h3>
          <dl className="mt-3 space-y-2">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Opportunity</dt>
              <dd className="text-right font-medium">{projectTitle}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Amount</dt>
              <dd className="font-medium">
                {formatMoney({ amountMinor: parsedMinor, currency })}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Currency</dt>
              <dd className="font-medium">{currency}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Terms version</dt>
              <dd className="font-medium">{termsVersion}</dd>
            </div>
          </dl>
        </div>

        <form action={formAction} className="space-y-3">
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="amountMajor" value={amountMajor} />
          {state.error ? (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          ) : null}
          <SubmitButton label="Complete payment" />
        </form>

        <Button type="button" variant="ghost" className="w-full" onClick={() => setStep("amount")}>
          Edit amount
        </Button>

        <p className="text-xs text-muted-foreground">
          Development checkout uses a simulated payment provider. This is not a real
          payment. No returns or ownership are implied.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={goToReview} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amountMajor">Investment amount ({currency})</Label>
        <Input
          id="amountMajor"
          name="amountMajor"
          required
          placeholder="10000.00"
          inputMode="decimal"
          value={amountMajor}
          onChange={(event) => setAmountMajor(event.target.value)}
          aria-describedby="amount-constraints"
        />
        <div id="amount-constraints" className="space-y-1 text-xs text-muted-foreground">
          {minimumInvestment ? <p>Minimum {formatMoney(minimumInvestment)}</p> : null}
          {maximumInvestment ? <p>Maximum {formatMoney(maximumInvestment)}</p> : null}
          {fundingTargetMinor != null ? (
            <p>
              Target {formatMoney({ amountMinor: fundingTargetMinor, currency })} ·{" "}
              {formatMoney({
                amountMinor: committedAmountMinor ?? 0,
                currency,
              })}{" "}
              confirmed
              {remainingMinor != null
                ? ` · ${formatMoney({ amountMinor: remainingMinor, currency })} remaining`
                : null}
            </p>
          ) : null}
        </div>
      </div>

      {localError || state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {localError ?? state.error}
        </p>
      ) : null}

      <Button type="submit" className="w-full">
        Review investment
      </Button>
      <p className="text-xs text-muted-foreground">
        No returns, ownership, or instrument type are implied.
      </p>
    </form>
  );
}
