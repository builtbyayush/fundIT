import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { MockCheckoutForm } from "@/components/payments/mock-checkout-form";
import { Container } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/auth";
import { UserRole } from "@/constants/roles";
import { connectToDatabase } from "@/lib/db";
import { getInvestorInvestment } from "@/services/investment.service";
import { formatMoney } from "@/lib/money";
import { PaymentOrder } from "@/models/PaymentOrder";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payment simulation",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ orderId?: string; investmentId?: string }>;
}

export default async function MockCheckoutPage({ searchParams }: PageProps) {
  if (process.env.NODE_ENV === "production") {
    redirect("/unauthorized");
  }

  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.INVESTOR) {
    redirect("/login");
  }

  const params = await searchParams;
  if (!params.orderId || !params.investmentId) {
    redirect("/investor/investments");
  }

  await connectToDatabase();
  const investment = await getInvestorInvestment(params.investmentId, session.user.id);
  const order = await PaymentOrder.findOne({
    investment: investment._id,
    providerOrderId: params.orderId,
  });

  if (!order) {
    redirect("/investor/investments");
  }

  return (
    <Container className="py-12">
      <Card variant="elevated" className="mx-auto max-w-lg">
        <CardHeader className="space-y-3">
          <Badge variant="pastelYellow" className="w-fit">
            Development payment simulation
          </Badge>
          <CardTitle className="font-display text-2xl">Checkout</CardTitle>
          <CardDescription>
            {investment.investmentNumber} ·{" "}
            {formatMoney({
              amountMinor: investment.amountMinor,
              currency: investment.currency,
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MockCheckoutForm
            investmentId={investment._id.toString()}
            providerOrderId={order.providerOrderId}
          />
        </CardContent>
      </Card>
    </Container>
  );
}
