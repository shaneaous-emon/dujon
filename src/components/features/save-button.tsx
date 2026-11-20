"use client";

import { useOptimistic, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { useTranslations } from "next-intl";
import { toggleSaveAction } from "@/actions/social";
import { cn } from "@/lib/cn";

export function SaveButton({ publicId, name, saved, className, withLabel = false }: { publicId: string; name: string; saved: boolean; className?: string; withLabel?: boolean }) {
  const t = useTranslations("search");
  const s = useTranslations("saved");
  const [, start] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(saved, (_cur, next: boolean) => next);
  return (
    <button
      type="button"
      aria-pressed={optimistic}
      aria-label={optimistic ? t("unsaveAria", { name }) : t("saveAria", { name })}
      onClick={() =>
        start(async () => {
          setOptimistic(!optimistic);
          await toggleSaveAction(publicId);
        })
      }
      className={cn("hover:bg-surface-muted inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full px-2", optimistic ? "text-accent" : "text-text-muted", className)}
    >
      <Bookmark aria-hidden="true" className="size-6" fill={optimistic ? "currentColor" : "none"} />
      {withLabel ? <span className="font-medium">{s("saved")}</span> : null}
    </button>
  );
}
