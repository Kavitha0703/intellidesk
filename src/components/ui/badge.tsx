import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Status variants
        pending: "border-transparent bg-status-pending/10 text-status-pending",
        inProgress: "border-transparent bg-status-in-progress/10 text-status-in-progress",
        resolved: "border-transparent bg-status-resolved/10 text-status-resolved",
        // Severity variants
        notUrgent: "border-transparent bg-severity-not-urgent/10 text-severity-not-urgent",
        medium: "border-transparent bg-severity-medium/10 text-severity-medium",
        urgent: "border-transparent bg-severity-urgent/10 text-severity-urgent",
        critical: "border-transparent bg-severity-critical/10 text-severity-critical",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
