import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/cn";

type Tone = "info" | "success" | "warning" | "danger";

const tones: Record<Tone, { box: string; Icon: typeof Info }> = {
  info: { box: "border-border bg-surface-muted text-text", Icon: Info },
  success: { box: "border-success/30 bg-success-soft text-success", Icon: CheckCircle2 },
  warning: { box: "border-warning/30 bg-warning-soft text-warning", Icon: AlertTriangle },
  danger: { box: "border-danger/30 bg-danger-soft text-danger", Icon: XCircle },
};

export interface AlertProps {
  tone?: Tone;
  title?: ReactNode;
  children?: ReactNode;
  /** Announce to screen readers when it appears (errors, results). */
  live?: boolean;
  className?: string;
}

export function Alert({ tone = "info", title, children, live = false, className }: AlertProps) {
  const { box, Icon } = tones[tone];
  return (
    <div
      role={live ? (tone === "danger" ? "alert" : "status") : undefined}
      className={cn("flex gap-3 rounded-md border p-4", box, className)}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      <div className="flex flex-col gap-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className="text-text">{children}</div> : null}
      </div>
    </div>
  );
}
