import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { INVESTMENT_STATUSES } from "@/constants/investment-status";
import { PAYMENT_STATUSES } from "@/constants/payment-status";
import { formatMoney } from "@/lib/money";
import { connectToDatabase } from "@/lib/db";
import {
  investmentStatusLabel,
  paymentStatusLabel,
} from "@/lib/status-labels";
import { adminInvestmentListQuerySchema } from "@/lib/validations/investment";
import {
  listAdminInvestments,
  serializeInvestment,
} from "@/services/investment.service";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminInvestmentsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = adminInvestmentListQuerySchema.parse({
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    search: typeof params.search === "string" ? params.search : "",
    status: typeof params.status === "string" ? params.status : "",
    paymentStatus:
      typeof params.paymentStatus === "string" ? params.paymentStatus : "",
  });

  await connectToDatabase();
  const result = await listAdminInvestments(query);
  const investments = result.items.map(serializeInvestment);

  const buildHref = (page: number) => {
    const sp = new URLSearchParams();
    sp.set("page", String(page));
    if (query.search) sp.set("search", query.search);
    if (query.status) sp.set("status", query.status);
    if (query.paymentStatus) sp.set("paymentStatus", query.paymentStatus);
    return `/admin/investments?${sp.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Admin / Investments
        </p>
        <h2 className="text-2xl font-bold tracking-tight">Investments</h2>
        <p className="text-muted-foreground">
          Confirmed commitments are distinct from payment attempts.
        </p>
      </div>

      <form className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-4">
        <Input
          name="search"
          placeholder="Search investment number"
          defaultValue={query.search}
          aria-label="Search investment number"
        />
        <Select name="status" defaultValue={query.status || ""} aria-label="Investment status">
          <option value="">All investment statuses</option>
          {INVESTMENT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {investmentStatusLabel(status)}
            </option>
          ))}
        </Select>
        <Select
          name="paymentStatus"
          defaultValue={query.paymentStatus || ""}
          aria-label="Payment status"
        >
          <option value="">All payment statuses</option>
          {PAYMENT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {paymentStatusLabel(status)}
            </option>
          ))}
        </Select>
        <Button type="submit" variant="secondary">
          Apply filters
        </Button>
      </form>

      {investments.length === 0 ? (
        <div className="rounded-xl border bg-card p-10 text-center">
          <h3 className="text-lg font-semibold">No investments yet.</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Investor commitments will appear here once created.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b bg-muted/40 text-muted-foreground">
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
                <tr key={item.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{item.investmentNumber}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {"email" in item.investor ? item.investor.email : item.investor.id}
                  </td>
                  <td className="px-4 py-3">
                    {"title" in item.project ? item.project.title : item.project.id}
                  </td>
                  <td className="px-4 py-3">
                    {formatMoney({
                      amountMinor: item.amountMinor,
                      currency: item.currency,
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">
                      {investmentStatusLabel(item.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">
                      {paymentStatusLabel(item.paymentStatus)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {result.totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Page {result.page} of {result.totalPages} · {result.total} total
          </p>
          <div className="flex gap-2">
            {result.page > 1 ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={buildHref(result.page - 1)}>Previous</Link>
              </Button>
            ) : null}
            {result.page < result.totalPages ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={buildHref(result.page + 1)}>Next</Link>
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
