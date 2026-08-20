import { AlertTriangle, Ban, Check, Clock, Info } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  getInvestmentStatusPresentation,
  type InvestorStatusIcon,
} from "@/lib/investor/status-presentation";
import { cn } from "@/lib/utils";

const STATUS_ICONS: Record<InvestorStatusIcon, LucideIcon> = {
  check: Check,
  clock: Clock,
  alert: AlertTriangle,
  cancel: Ban,
  info: Info,
};

export function InvestmentStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const presentation = getInvestmentStatusPresentation(status);
  const Icon = STATUS_ICONS[presentation.icon];

  return (
    <Badge
      variant={presentation.badgeVariant}
      className={cn("gap-1", className)}
      aria-label={presentation.label}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {presentation.label}
    </Badge>
  );
}
