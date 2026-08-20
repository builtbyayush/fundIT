import Link from "next/link";
import { Inbox, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { getInvestmentStatusPresentation } from "@/lib/investor/status-presentation";
import { formatMoney } from "@/lib/money";
import { paymentStatusLabel } from "@/lib/status-labels";
import type { serializeInvestment } from "@/services/investment.service";

type AdminInvestment = ReturnType<typeof serializeInvestment>;

function InvestorCell({ investment }: { investment: AdminInvestment }) {
  if ("email" in investment.investor) {
    return (
      <span>
        <span className="block text-sm font-medium text-foreground">
          {investment.investor.name || "Investor"}
        </span>
        <span className="text-xs text-muted-foreground">{investment.investor.email}</span>
      </span>
    );
  }
  return <span className="text-sm text-muted-foreground">{investment.investor.id}</span>;
}

function ProjectCell({ investment }: { investment: AdminInvestment }) {
  if ("title" in investment.project) {
    return (
      <Link
        href={`/admin/projects/${investment.project.id}/investment`}
        className="font-medium text-foreground hover:underline"
      >
        {investment.project.title}
      </Link>
    );
  }
  return <span className="text-muted-foreground">{investment.project.id}</span>;
}

export function AdminInvestmentList({
  investments,
  filtered,
}: {
  investments: AdminInvestment[];
  filtered: boolean;
}) {
  if (investments.length === 0) {
    if (filtered) {
      return (
        <EmptyState
          icon={Search}
          className="shadow-none"
          title="No investments match these filters"
          description="Try another investment number, status, or payment status."
        />
      );
    }
    return (
      <EmptyState
        icon={Inbox}
        className="shadow-none"
        title="No investments yet."
        description="Investor commitments will appear here once created."
      />
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-xl border border-border/80 bg-card lg:block">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border/80 bg-muted/40 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Number</th>
              <th className="px-4 py-3 font-medium">Investor</th>
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {investments.map((item) => (
              <tr key={item.id} className="border-b border-border/80 last:border-0">
                <td className="px-4 py-3 font-medium">{item.investmentNumber}</td>
                <td className="px-4 py-3">
                  <InvestorCell investment={item} />
                </td>
                <td className="px-4 py-3">
                  <ProjectCell investment={item} />
                </td>
                <td className="px-4 py-3">
                  {formatMoney({
                    amountMinor: item.amountMinor,
                    currency: item.currency,
                  })}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={getInvestmentStatusPresentation(item.status).badgeVariant}>
                    {getInvestmentStatusPresentation(item.status).label}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline">{paymentStatusLabel(item.paymentStatus)}</Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(item.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 lg:hidden">
        {investments.map((item) => (
          <li key={item.id} className="space-y-3 rounded-xl border border-border/80 bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <span className="font-medium">{item.investmentNumber}</span>
              <Badge variant={getInvestmentStatusPresentation(item.status).badgeVariant}>
                {getInvestmentStatusPresentation(item.status).label}
              </Badge>
            </div>
            <InvestorCell investment={item} />
            <div className="text-sm">
              <ProjectCell investment={item} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span>
                {formatMoney({
                  amountMinor: item.amountMinor,
                  currency: item.currency,
                })}
              </span>
              <Badge variant="outline">{paymentStatusLabel(item.paymentStatus)}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(item.createdAt).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}
