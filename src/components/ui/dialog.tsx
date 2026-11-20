"use client";

import type { ReactNode } from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";

export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/** Accessible modal: focus trap, ESC to close, focus returns to trigger (Radix). */
export function Dialog({ open, onOpenChange, trigger, title, description, children, footer, className }: DialogProps) {
  const t = useTranslations("common");
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger ? <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger> : null}
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-40 bg-text/40" />
        <RadixDialog.Content
          className={cn(
            "fixed inset-x-4 bottom-4 z-50 mx-auto max-h-[85dvh] max-w-lg overflow-y-auto rounded-lg bg-surface p-6 shadow-card",
            "sm:inset-x-0 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2",
            className,
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <RadixDialog.Title className="text-xl font-bold">{title}</RadixDialog.Title>
            <RadixDialog.Close
              aria-label={t("close")}
              className="-me-2 -mt-2 inline-flex size-11 items-center justify-center rounded-full hover:bg-surface-muted"
            >
              <X aria-hidden="true" className="size-5" />
            </RadixDialog.Close>
          </div>
          {description ? (
            <RadixDialog.Description className="mt-2 text-text-muted">{description}</RadixDialog.Description>
          ) : (
            <RadixDialog.Description className="sr-only">{title}</RadixDialog.Description>
          )}
          {children ? <div className="mt-4">{children}</div> : null}
          {footer ? <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">{footer}</div> : null}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

export const DialogClose = RadixDialog.Close;
