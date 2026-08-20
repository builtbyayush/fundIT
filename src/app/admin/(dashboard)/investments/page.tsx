import Link from "next/link";

import { AdminInvestmentList } from "@/components/admin/admin-investment-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { INVESTMENT_STATUSES } from "@/constants/investment-status";
import { PAYMENT_STATUSES } from "@/constants/payment-status";
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
  const filtered = Boolean(query.search || query.status || query.paymentStatus);

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
        <h2 className="text-xl font-semibold tracking-tight">Investments</h2>
        <p className="text-sm text-muted-foreground">
          {result.total} investment{result.total === 1 ? "" : "s"}
          {filtered ? " matching filters" : ""}
        </p>
      </div>

      <form className="grid gap-3 rounded-xl border border-border/80 bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
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

      <AdminInvestmentList investments={investments} filtered={filtered} />

      {result.totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Page {result.page} of {result.totalPages} · {result.total} investments
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
