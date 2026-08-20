import Link from "next/link";
import { Compass, SearchX, Wallet } from "lucide-react";

import { InvestmentCard } from "@/components/investor/investment-card";
import { InvestmentFilterPills } from "@/components/investor/investment-filter-pills";
import { EmptyState } from "@/components/shared/empty-state";
import { Container } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserRole } from "@/constants/roles";
import { requireRole } from "@/lib/auth/guards";
import { connectToDatabase } from "@/lib/db";
import { investmentsListHref, toInvestorInvestmentCard } from "@/lib/investor/investment-card";
import { investorInvestmentListQuerySchema } from "@/lib/validations/investment";
import { getInvestmentSummariesForProjects } from "@/services/opportunity.service";
import {
  listInvestorInvestments,
  serializeInvestment,
} from "@/services/investment.service";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function emptyCopy(status: string, search: string) {
  if (search) {
    return {
      icon: SearchX,
      title: "No matching investments",
      description: "Try a different project name, or clear the search to see everything you’ve backed.",
    };
  }
  if (status === "confirmed") {
    return {
      icon: Wallet,
      title: "No confirmed investments yet",
      description: "Once a payment goes through, it will show up here.",
    };
  }
  if (status === "pending") {
    return {
      icon: Wallet,
      title: "No pending payments",
      description: "You’re all caught up. Nothing is waiting on checkout right now.",
    };
  }
  if (status === "failed") {
    return {
      icon: Wallet,
      title: "No failed payments",
      description: "That’s a good thing. Failed checkouts would appear here if they happen.",
    };
  }
  return {
    icon: Compass,
    title: "Your FundIt story starts here.",
    description: "Discover interesting ideas and back the ones you believe in.",
  };
}

export default async function InvestorInvestmentsPage({ searchParams }: PageProps) {
  const investor = await requireRole(UserRole.INVESTOR);
  const params = await searchParams;
  const query = investorInvestmentListQuerySchema.parse({
    page: params.page ?? 1,
    limit: params.limit ?? 12,
    status: typeof params.status === "string" ? params.status : "all",
    search: typeof params.search === "string" ? params.search : "",
  });

  await connectToDatabase();
  const result = await listInvestorInvestments(investor.id, query);
  const investments = result.items.map(serializeInvestment);
  const summaries = await getInvestmentSummariesForProjects(
    investments.map((item) => item.project.id),
  );
  const cards = investments.map((item) =>
    toInvestorInvestmentCard(item, summaries.get(item.project.id)),
  );

  const empty = emptyCopy(query.status, query.search);
  const hasFilters = query.status !== "all" || Boolean(query.search);

  return (
    <Container className="py-10 sm:py-12">
      <div className="mb-8 max-w-2xl space-y-2">
        <h1 className="font-display text-3xl tracking-tight sm:text-4xl">My investments</h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          Keep track of the ideas you’ve backed.
        </p>
      </div>

      <div className="mb-8 space-y-4">
        <InvestmentFilterPills status={query.status} search={query.search} />
        {cards.length > 0 || hasFilters ? (
          <form action="/investor/investments" method="get" className="max-w-md">
            {query.status !== "all" ? (
              <input type="hidden" name="status" value={query.status} />
            ) : null}
            <Input
              name="search"
              defaultValue={query.search}
              placeholder="Search by project name"
              aria-label="Search investments by project name"
            />
          </form>
        ) : null}
      </div>

      {cards.length === 0 ? (
        <EmptyState
          icon={empty.icon}
          title={empty.title}
          description={empty.description}
          action={
            hasFilters ? (
              <Button variant="outline" asChild>
                <Link href="/investor/investments">Clear filters</Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/projects">Explore ideas</Link>
              </Button>
            )
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((investment) => (
            <InvestmentCard key={investment.id} investment={investment} />
          ))}
        </div>
      )}

      {result.totalPages > 1 ? (
        <div className="mt-8 flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Page {result.page} of {result.totalPages}
          </p>
          <div className="flex gap-2">
            {result.page > 1 ? (
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={investmentsListHref({
                    status: query.status,
                    search: query.search,
                    page: result.page - 1,
                  })}
                >
                  Previous
                </Link>
              </Button>
            ) : null}
            {result.page < result.totalPages ? (
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={investmentsListHref({
                    status: query.status,
                    search: query.search,
                    page: result.page + 1,
                  })}
                >
                  Next
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </Container>
  );
}
