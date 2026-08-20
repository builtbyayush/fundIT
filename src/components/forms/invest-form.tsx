"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createInvestmentAction, type ActionState } from "@/lib/actions/investment";
import { formatMoney, parseMajorToMinor } from "@/lib/money";
import {
  defaultAmountStepMinor,
  formatMinorAsMajorInput,
  investmentAmountPresets,
  stepAmountMinor,
} from "@/lib/project/invest-amount";
import { opportunityStatusLabel } from "@/lib/status-labels";
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
  opportunityStatus,
  termsVersion,
  minimumInvestment,
  maximumInvestment,
  fundingTargetMinor,
  committedAmountMinor,
}: {
  projectId: string;
  projectTitle: string;
  currency: CurrencyCode;
  opportunityStatus: string;
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
  const stepMinor = minimumInvestment?.amountMinor ?? defaultAmountStepMinor(currency);
  const presets = investmentAmountPresets({
    minimumMinor: minimumInvestment?.amountMinor ?? null,
    maximumMinor: maximumInvestment?.amountMinor ?? null,
    remainingMinor,
  });

  const parsedMinor = useMemo(() => {
    try {
      if (!amountMajor.trim()) return null;
      return parseMajorToMinor(amountMajor, currency);
    } catch {
      return null;
    }
  }, [amountMajor, currency]);

  function applyStep(direction: 1 | -1) {
    const next = stepAmountMinor({
      currentMinor: parsedMinor,
      direction,
      stepMinor,
      minimumMinor: minimumInvestment?.amountMinor ?? null,
      maximumMinor: maximumInvestment?.amountMinor ?? null,
      remainingMinor,
    });
    setAmountMajor(formatMinorAsMajorInput(next, currency));
    setLocalError(null);
  }

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
        <div className="rounded-2xl border border-border/60 bg-pastel-lavender/50 p-4 text-sm">
          <h3 className="font-semibold text-foreground">Review</h3>
          <dl className="mt-3 space-y-2">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Idea</dt>
              <dd className="text-right font-medium">{projectTitle}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Amount</dt>
              <dd className="font-medium">
                {formatMoney({ amountMinor: parsedMinor, currency })}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Status</dt>
              <dd className="font-medium">{opportunityStatusLabel(opportunityStatus)}</dd>
            </div>
            {termsVersion ? (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Terms</dt>
                <dd className="font-medium">Version {termsVersion}</dd>
              </div>
            ) : null}
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
          Complete payment continues to a development payment simulation. This is not a
          real payment. No returns or ownership are implied.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={goToReview} className="space-y-5">
      <div className="space-y-3">
        <Label htmlFor="amountMajor" className="text-muted-foreground">
          Amount ({currency})
        </Label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Decrease amount"
            onClick={() => applyStep(-1)}
          >
            <Minus />
          </Button>
          <Input
            id="amountMajor"
            name="amountMajor"
            required
            inputMode="decimal"
            value={amountMajor}
            onChange={(event) => setAmountMajor(event.target.value)}
            aria-describedby="amount-constraints"
            className="h-14 min-h-14 text-center font-display text-2xl"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Increase amount"
            onClick={() => applyStep(1)}
          >
            <Plus />
          </Button>
        </div>
        <div id="amount-constraints" className="space-y-1 text-xs text-muted-foreground">
          {minimumInvestment ? <p>Starts at {formatMoney(minimumInvestment)}</p> : null}
          {maximumInvestment ? <p>Up to {formatMoney(maximumInvestment)}</p> : null}
          {fundingTargetMinor != null ? (
            <p>
              {formatMoney({
                amountMinor: committedAmountMinor ?? 0,
                currency,
              })}{" "}
              backed
              {remainingMinor != null
                ? ` · ${formatMoney({ amountMinor: remainingMinor, currency })} remaining`
                : null}
            </p>
          ) : null}
        </div>
      </div>

      {presets.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {presets.map((amountMinor) => (
            <Button
              key={amountMinor}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setAmountMajor(formatMinorAsMajorInput(amountMinor, currency));
                setLocalError(null);
              }}
            >
              {formatMoney({ amountMinor, currency })}
            </Button>
          ))}
        </div>
      ) : null}

      {localError || state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {localError ?? state.error}
        </p>
      ) : null}

      <Button type="submit" className="w-full" size="lg">
        Review
      </Button>
      <p className="text-xs text-muted-foreground">
        No returns, ownership, or instrument type are implied.
      </p>
    </form>
  );
}
