import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Readable article column (max 68ch, docs/04 SCR-02). */
export function Article({
  title,
  intro,
  children,
  className,
}: {
  title: ReactNode;
  intro?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div>
      <div className="border-border/70 bg-gradient-to-b from-[#f6ede3] to-bg border-b">
        <div className={cn("mx-auto max-w-3xl px-4 py-10 sm:py-14", className)}>
          <div className="bg-accent mb-4 h-1 w-12 rounded-full" aria-hidden="true" />
          <h1 className="text-3xl sm:text-4xl">{title}</h1>
          {intro ? <p className="text-text-muted mt-4 text-lg leading-relaxed">{intro}</p> : null}
        </div>
      </div>
      <article className={cn("mx-auto max-w-3xl px-4 py-10 sm:py-12", className)}>
        <div className="flex flex-col gap-8">{children}</div>
      </article>
    </div>
  );
}

export function Section({ title, children, id }: { title: ReactNode; children: ReactNode; id?: string }) {
  return (
    <section
      id={id}
      aria-labelledby={id ? `${id}-h` : undefined}
      className="border-border bg-surface shadow-card scroll-mt-24 rounded-2xl border p-6 sm:p-7"
    >
      <h2 id={id ? `${id}-h` : undefined} className="text-accent mb-3 text-xl sm:text-2xl">
        {title}
      </h2>
      <div className="flex flex-col gap-3 leading-relaxed">{children}</div>
    </section>
  );
}
