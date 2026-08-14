import Link from "next/link";

import { Container } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { siteConfig } from "@/config";
import { DEFAULT_CURRENCY } from "@/constants/currency";
import { UserRole } from "@/constants/roles";
import { requireRole } from "@/lib/auth/guards";
import { connectToDatabase } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { getInvestorInvestmentStats } from "@/services/investment.service";

export const dynamic = "force-dynamic";

export default async function InvestorDashboardPage() {
  const investor = await requireRole(UserRole.INVESTOR);
  await connectToDatabase();
  const stats = await getInvestorInvestmentStats(investor.id);

  return (
    <Container className="py-10 sm:py-12">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Investor dashboard
        </h1>
        <p className="text-muted-foreground">
          Your {siteConfig.name} overview. Totals reflect commitment counts and confirmed
          amounts — not portfolio value or returns.
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total investments</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Confirmed</CardDescription>
            <CardTitle className="text-3xl">{stats.confirmed}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending payment</CardDescription>
            <CardTitle className="text-3xl">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Confirmed amount</CardDescription>
            <CardTitle className="text-2xl">
              {formatMoney({
                amountMinor: stats.confirmedAmountMinor,
                currency: DEFAULT_CURRENCY,
              })}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Explore opportunities</CardTitle>
            <CardDescription>
              Browse curated investment projects that are open for commitment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/projects">Explore</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>My investments</CardTitle>
            <CardDescription>
              Review commitment status and continue pending payments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link href="/investor/investments">View history</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
