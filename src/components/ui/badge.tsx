import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-meta motion-safe-transition focus:outline-none focus:ring-2 focus:ring-ring/40 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow-soft",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        accent: "border-transparent bg-accent text-accent-foreground",
        outline: "text-foreground",
        muted: "border-transparent bg-muted text-muted-foreground",
        pastelPink: "border-transparent bg-pastel-pink text-pastel-pink-foreground",
        pastelPeach: "border-transparent bg-pastel-peach text-pastel-peach-foreground",
        pastelYellow: "border-transparent bg-pastel-yellow text-pastel-yellow-foreground",
        pastelMint: "border-transparent bg-pastel-mint text-pastel-mint-foreground",
        pastelBlue: "border-transparent bg-pastel-blue text-pastel-blue-foreground",
        pastelLavender: "border-transparent bg-pastel-lavender text-pastel-lavender-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
