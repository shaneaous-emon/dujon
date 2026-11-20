import { Check } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/cn";

const STEPS = ["about", "location", "photo", "preferences", "review"] as const;

export async function Stepper({ current }: { current: (typeof STEPS)[number] }) {
  const t = await getTranslations("onboarding");
  const idx = STEPS.indexOf(current);
  const label = (s: (typeof STEPS)[number]) => (s === "review" ? t("review") : t(`${s}.title` as never));
  return (
    <div className="mb-6">
      <p className="text-text-muted mb-2 text-sm font-medium" aria-live="polite">
        {t("step", { current: idx + 1, total: STEPS.length })}
      </p>
      <ol className="flex gap-1.5" aria-label={t("title")}>
        {STEPS.map((s, i) => (
          <li key={s} className="flex-1" aria-current={i === idx ? "step" : undefined}>
            <div className={cn("h-2 rounded-full", i < idx ? "bg-accent" : i === idx ? "bg-accent/60" : "bg-border")} />
            <span className="sr-only">
              {label(s)}
              {i < idx ? <Check aria-hidden="true" /> : null}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
