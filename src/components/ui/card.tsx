import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "border-border bg-surface shadow-card rounded-2xl border p-6 transition-all duration-300",
        className,
      )}
      {...props}
    />
  );
}
