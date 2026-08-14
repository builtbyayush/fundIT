"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { resumePaymentAction } from "@/lib/actions/investment";

export function ResumePaymentButton({ investmentId }: { investmentId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const result = await resumePaymentAction(investmentId);
          if (result.redirectUrl) {
            router.push(result.redirectUrl);
          }
        });
      }}
    >
      {pending ? "Opening checkout…" : "Complete payment"}
    </Button>
  );
}
