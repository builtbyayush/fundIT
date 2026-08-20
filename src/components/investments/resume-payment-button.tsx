"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { resumePaymentAction } from "@/lib/actions/investment";

export function ResumePaymentButton({
  investmentId,
  label = "Complete payment",
  variant = "default",
  className,
}: {
  investmentId: string;
  label?: string;
  variant?: "default" | "outline" | "secondary";
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      disabled={pending}
      variant={variant}
      className={className}
      onClick={() => {
        startTransition(async () => {
          const result = await resumePaymentAction(investmentId);
          if (result.redirectUrl) {
            router.push(result.redirectUrl);
          }
        });
      }}
    >
      {pending ? "Opening checkout…" : label}
    </Button>
  );
}
