import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export const controlClasses =
  "min-h-11 w-full rounded-md border border-border bg-surface px-3 py-2 text-base text-text " +
  "placeholder:text-text-muted/70 focus-visible:outline-2 focus-visible:outline-accent " +
  "aria-[invalid=true]:border-danger disabled:bg-surface-muted";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, ...props },
  ref,
) {
  return (
    <input ref={ref} aria-invalid={invalid || undefined} className={cn(controlClasses, className)} {...props} />
  );
});
