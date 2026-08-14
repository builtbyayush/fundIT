import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DEFAULT_CURRENCY } from "@/constants/currency";
import { formatMoney } from "@/lib/money";
import { connectToDatabase } from "@/lib/db";
import { getAdminInvestmentStats } from "@/services/investment.service";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await connectToDatabase();
  const stats = await getAdminInvestmentStats();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">
          Manage FundIt opportunities from the admin portal.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            <CardDescription>Pending payments</CardDescription>
            <CardTitle className="text-3xl">{stats.pendingPayments}</CardTitle>
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Projects</CardTitle>
            <CardDescription>Create, edit, and publish opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admin/projects">Manage projects</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Investments</CardTitle>
            <CardDescription>Review commitments and payment status</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admin/investments">View investments</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Categories</CardTitle>
            <CardDescription>Database-backed categories are seeded and active</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Admin category management UI arrives later. Use seed:categories for now.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
