import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-2xl border border-border/60 text-card-foreground",
  {
    variants: {
      variant: {
        default: "bg-card shadow-card",
        elevated: "bg-surface-elevated shadow-elevated",
        pastel: "shadow-soft",
        interactive:
          "bg-card shadow-card motion-safe-hover-lift motion-safe-transition hover:shadow-elevated",
      },
      pastel: {
        none: "",
        pink: "bg-pastel-pink text-pastel-pink-foreground",
        peach: "bg-pastel-peach text-pastel-peach-foreground",
        yellow: "bg-pastel-yellow text-pastel-yellow-foreground",
        mint: "bg-pastel-mint text-pastel-mint-foreground",
        blue: "bg-pastel-blue text-pastel-blue-foreground",
        lavender: "bg-pastel-lavender text-pastel-lavender-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
      pastel: "none",
    },
    compoundVariants: [
      {
        variant: "pastel",
        pastel: "none",
        class: "bg-pastel-lavender text-pastel-lavender-foreground",
      },
    ],
  },
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, pastel, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, pastel }), className)}
      {...props}
    />
  ),
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("font-display text-2xl leading-none text-foreground", className)}
      {...props}
    />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm leading-relaxed text-muted-foreground", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  ),
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants };
