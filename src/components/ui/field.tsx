import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";

export interface FieldProps {
  id: string;
  label: ReactNode;
  required?: boolean;
  /** Show "(optional)" next to the label. */
  optional?: boolean;
  help?: ReactNode;
  error?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** ids for help/error text so inputs can reference them via aria-describedby. */
export function fieldDescribedBy(id: string, { help, error }: { help?: unknown; error?: unknown }) {
  const ids = [help ? `${id}-help` : null, error ? `${id}-error` : null].filter(Boolean);
  return ids.length ? ids.join(" ") : undefined;
}

/**
 * Label + control + helper + error (NFR-A11Y-003). Labels are always visible;
 * required fields get a text marker, not only an asterisk (docs/04 §10).
 */
export function Field({ id, label, required, optional, help, error, className, children }: FieldProps) {
  const t = useTranslations("common");
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="font-medium">
        {label}
        {required ? <span className="ms-1 text-sm font-normal text-text-muted">{t("required")}</span> : null}
        {optional ? <span className="ms-1 text-sm font-normal text-text-muted">{t("optional")}</span> : null}
      </label>
      {children}
      {help ? (
        <p id={`${id}-help`} className="text-sm text-text-muted">
          {help}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
