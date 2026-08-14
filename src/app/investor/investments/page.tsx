import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/section-heading";
import { InvestmentStatus } from "@/constants/investment-status";
import { formatMoney } from "@/lib/money";
import { connectToDatabase } from "@/lib/db";
import { requireRole } from "@/lib/auth/guards";
import { UserRole } from "@/constants/roles";
import {
  investmentStatusLabel,
  paymentStatusLabel,
} from "@/lib/status-labels";
import { investorInvestmentListQuerySchema } from "@/lib/validations/investment";
import {
  listInvestorInvestments,
  serializeInvestment,
} from "@/services/investment.service";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function InvestorInvestmentsPage({ searchParams }: PageProps) {
  const investor = await requireRole(UserRole.INVESTOR);
  const params = await searchParams;
  const query = investorInvestmentListQuerySchema.parse({
    page: params.page ?? 1,
    limit: params.limit ?? 10,
  });

  await connectToDatabase();
  const result = await listInvestorInvestments(investor.id, query.page, query.limit);
  const investments = result.items.map(serializeInvestment);

  return (
    <Container className="py-10 sm:py-12">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">My investments</h1>
        <p className="text-muted-foreground">
          Track commitments and payment status. Confirmed amounts are separate from
          pending payment attempts.
        </p>
      </div>

      {investments.length === 0 ? (
        <div className="rounded-xl border bg-card p-10 text-center">
          <h2 className="text-lg font-semibold">
            You haven&apos;t invested in an opportunity yet.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Explore open opportunities to make your first commitment.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/projects">Explore opportunities</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-4 md:hidden">
            {investments.map((item) => (
              <div key={item.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{item.investmentNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {"title" in item.project ? item.project.title : item.project.id}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/investor/investments/${item.id}`}>View</Link>
                  </Button>
                </div>
                <p className="mt-3 text-lg font-semibold">
                  {formatMoney({
                    amountMinor: item.amountMinor,
                    currency: item.currency,
                  })}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="secondary">{investmentStatusLabel(item.status)}</Badge>
                  <Badge variant="outline">{paymentStatusLabel(item.paymentStatus)}</Badge>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-xl border bg-card md:block">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Number</th>
                  <th className="px-4 py-3 font-medium">Project</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {investments.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{item.investmentNumber}</td>
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
                      {item.status === InvestmentStatus.PAYMENT_PENDING ? (
                        <span className="sr-only">Action needed: complete payment</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">
                        {paymentStatusLabel(item.paymentStatus)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/investor/investments/${item.id}`}>View</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {result.totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Page {result.page} of {result.totalPages}
          </p>
          <div className="flex gap-2">
            {result.page > 1 ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/investor/investments?page=${result.page - 1}`}>Previous</Link>
              </Button>
            ) : null}
            {result.page < result.totalPages ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/investor/investments?page=${result.page + 1}`}>Next</Link>
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </Container>
  );
}
