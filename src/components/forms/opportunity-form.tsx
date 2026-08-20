"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

import { FundingProgressBar } from "@/components/project/funding-progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  cancelOpportunityAction,
  closeOpportunityAction,
  openOpportunityAction,
  pauseOpportunityAction,
  saveOpportunityAction,
  type ActionState,
} from "@/lib/actions/investment";
import { OpportunityStatus } from "@/constants/opportunity-status";
import type { ProjectStatus } from "@/constants/project-status";
import { CURRENCY_MINOR_UNITS, type CurrencyCode } from "@/constants/currency";
import { opportunityOpenBlockers } from "@/lib/admin/opportunity-blockers";
import {
  opportunityStatusBadgeVariant,
  opportunityStatusLabel,
} from "@/lib/admin/status-presentation";
import { formatMoney } from "@/lib/money";

interface OpportunityFormValues {
  status?: OpportunityStatus;
  currency?: string;
  fundingTarget?: { amountMinor: number; currency: string } | null;
  minimumInvestment?: { amountMinor: number; currency: string } | null;
  maximumInvestment?: { amountMinor: number; currency: string } | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  termsVersion?: number;
  committedAmountMinor?: number;
}

function toMajor(amountMinor?: number | null, currency: CurrencyCode = "INR"): string {
  if (amountMinor == null) return "";
  return (amountMinor / CURRENCY_MINOR_UNITS[currency]).toFixed(2);
}

function toDateInput(value?: Date | string | null): string {
  if (!value) return "";
  const date = new Date(value);
  return date.toISOString().slice(0, 10);
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save terms"}
    </Button>
  );
}

export function OpportunityForm({
  projectId,
  projectStatus,
  initial,
}: {
  projectId: string;
  projectStatus: ProjectStatus;
  initial?: OpportunityFormValues | null;
}) {
  const router = useRouter();
  const action = saveOpportunityAction.bind(null, projectId);
  const [state, formAction] = useActionState(action, {} as ActionState);
  const currency = ((initial?.currency as CurrencyCode) || "INR") as CurrencyCode;

  useEffect(() => {
    if (state.success) router.refresh();
  }, [state, router]);

  return (
    <div className="space-y-6">
      {initial ? (
        <div className="rounded-xl border border-border/80 bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Opportunity overview</h2>
            <Badge variant={opportunityStatusBadgeVariant(initial.status ?? OpportunityStatus.DRAFT)}>
              {opportunityStatusLabel(initial.status ?? OpportunityStatus.DRAFT)}
            </Badge>
          </div>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Terms version</dt>
              <dd className="font-medium">{initial.termsVersion ?? 1}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Funding target</dt>
              <dd className="font-medium">
                {initial.fundingTarget
                  ? formatMoney({
                      amountMinor: initial.fundingTarget.amountMinor,
                      currency,
                    })
                  : "Not set"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Confirmed funding</dt>
              <dd className="font-medium">
                {formatMoney({
                  amountMinor: initial.committedAmountMinor ?? 0,
                  currency,
                })}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Minimum investment</dt>
              <dd className="font-medium">
                {initial.minimumInvestment
                  ? formatMoney({
                      amountMinor: initial.minimumInvestment.amountMinor,
                      currency,
                    })
                  : "Not set"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Maximum investment</dt>
              <dd className="font-medium">
                {initial.maximumInvestment
                  ? formatMoney({
                      amountMinor: initial.maximumInvestment.amountMinor,
                      currency,
                    })
                  : "Not set"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Start date</dt>
              <dd className="font-medium">
                {initial.startDate
                  ? new Date(initial.startDate).toLocaleDateString()
                  : "Not set"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">End date</dt>
              <dd className="font-medium">
                {initial.endDate ? new Date(initial.endDate).toLocaleDateString() : "Not set"}
              </dd>
            </div>
          </dl>
          {initial.fundingTarget ? (
            <div className="mt-4">
              <FundingProgressBar
                committedMinor={initial.committedAmountMinor ?? 0}
                targetMinor={initial.fundingTarget.amountMinor}
                currency={currency}
              />
            </div>
          ) : null}
        </div>
      ) : (
        <p className="rounded-xl border border-border/80 bg-card px-4 py-3 text-sm text-muted-foreground">
          No terms saved yet. Set a target and min/max, then open when the project is published.
        </p>
      )}

      <form action={formAction} className="space-y-4 rounded-xl border border-border/80 bg-card p-5">
        <div>
          <h2 className="text-base font-semibold">Investment terms</h2>
          <p className="text-sm text-muted-foreground">
            Generic configuration only. Final instrument details are pending client confirmation.
          </p>
        </div>

        {state.error ? (
          <p className="text-sm text-destructive" role="alert">
            {state.error}
          </p>
        ) : null}
        {state.success ? (
          <p className="text-sm text-secondary" role="status">
            Investment terms saved.
          </p>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select id="currency" name="currency" defaultValue={initial?.currency ?? "INR"}>
            <option value="INR">INR</option>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="fundingTargetMajor">Funding target</Label>
            <Input
              id="fundingTargetMajor"
              name="fundingTargetMajor"
              defaultValue={toMajor(initial?.fundingTarget?.amountMinor)}
              placeholder="100000.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="minimumInvestmentMajor">Minimum investment</Label>
            <Input
              id="minimumInvestmentMajor"
              name="minimumInvestmentMajor"
              defaultValue={toMajor(initial?.minimumInvestment?.amountMinor)}
              placeholder="1000.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maximumInvestmentMajor">Maximum investment</Label>
            <Input
              id="maximumInvestmentMajor"
              name="maximumInvestmentMajor"
              defaultValue={toMajor(initial?.maximumInvestment?.amountMinor)}
              placeholder="50000.00"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start date</Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              defaultValue={toDateInput(initial?.startDate)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">End date</Label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              defaultValue={toDateInput(initial?.endDate)}
            />
          </div>
        </div>

        <SubmitButton />
      </form>

      <OpportunityStatusActions
        projectId={projectId}
        projectStatus={projectStatus}
        initial={initial}
      />
    </div>
  );
}

function OpportunityStatusActions({
  projectId,
  projectStatus,
  initial,
}: {
  projectId: string;
  projectStatus: ProjectStatus;
  initial?: OpportunityFormValues | null;
}) {
  const router = useRouter();
  const status = initial?.status;
  const blockers = opportunityOpenBlockers({
    projectStatus,
    configured: Boolean(initial),
    fundingTargetMinor: initial?.fundingTarget?.amountMinor,
    minimumMinor: initial?.minimumInvestment?.amountMinor,
    maximumMinor: initial?.maximumInvestment?.amountMinor,
    startDate: initial?.startDate,
    endDate: initial?.endDate,
  });
  const canOpen =
    !status || status === OpportunityStatus.DRAFT || status === OpportunityStatus.PAUSED;

  async function run(
    action: (id: string) => Promise<ActionState>,
    message: string,
  ) {
    if (!window.confirm(message)) return;
    const result = await action(projectId);
    if (result.error) {
      window.alert(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-3 rounded-xl border border-border/80 bg-card p-4">
      <p className="text-sm text-muted-foreground">
        Status:{" "}
        <strong className="text-foreground">
          {status ? opportunityStatusLabel(status) : "Not configured"}
        </strong>
      </p>
      {canOpen && blockers.length > 0 ? (
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {blockers.map((blocker) => (
            <li key={blocker}>{blocker}</li>
          ))}
        </ul>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {canOpen ? (
          <Button
            size="sm"
            disabled={blockers.length > 0}
            onClick={() =>
              run(openOpportunityAction, "Open this investment opportunity?")
            }
          >
            Open
          </Button>
        ) : null}
        {status === OpportunityStatus.OPEN ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => run(pauseOpportunityAction, "Pause this opportunity?")}
          >
            Pause
          </Button>
        ) : null}
        {status === OpportunityStatus.OPEN || status === OpportunityStatus.PAUSED ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => run(closeOpportunityAction, "Close this opportunity?")}
          >
            Close
          </Button>
        ) : null}
        {status &&
        status !== OpportunityStatus.CANCELLED &&
        status !== OpportunityStatus.CLOSED ? (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => run(cancelOpportunityAction, "Cancel this opportunity?")}
          >
            Cancel
          </Button>
        ) : null}
      </div>
    </div>
  );
}
