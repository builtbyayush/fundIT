import { formatMoney } from "@/lib/money";
import { DEFAULT_CURRENCY } from "@/constants/currency";

type AdminMetric = {
  label: string;
  value: string;
};

export function AdminMetricStrip({
  draft,
  published,
  unpublished,
  archived,
  openOpportunities,
  confirmedAmountMinor,
  pendingPayments,
}: {
  draft: number;
  published: number;
  unpublished: number;
  archived: number;
  openOpportunities: number;
  confirmedAmountMinor: number;
  pendingPayments: number;
}) {
  const metrics: AdminMetric[] = [
    { label: "Draft", value: String(draft) },
    { label: "Published", value: String(published) },
    { label: "Unpublished", value: String(unpublished) },
    { label: "Archived", value: String(archived) },
    { label: "Open opportunities", value: String(openOpportunities) },
    {
      label: "Confirmed funding",
      value: formatMoney({
        amountMinor: confirmedAmountMinor,
        currency: DEFAULT_CURRENCY,
      }),
    },
    { label: "Pending payments", value: String(pendingPayments) },
  ];

  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border/80 bg-border/80 sm:grid-cols-4 lg:grid-cols-7">
      {metrics.map((metric) => (
        <div key={metric.label} className="bg-card px-3 py-3">
          <dt className="text-xs text-muted-foreground">{metric.label}</dt>
          <dd className="mt-1 text-lg font-semibold tabular-nums text-foreground">
            {metric.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
