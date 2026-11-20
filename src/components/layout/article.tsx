import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Readable article column (max 68ch, docs/04 SCR-02). */
export function Article({ title, intro, children, className }: { title: ReactNode; intro?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <article className={cn("mx-auto max-w-3xl px-4 py-10 sm:py-14", className)}>
      <h1 className="text-3xl sm:text-4xl">{title}</h1>
      {intro ? <p className="text-text-muted mt-4 text-lg">{intro}</p> : null}
      <div className="mt-8 flex flex-col gap-6">{children}</div>
    </article>
  );
}

export function Section({ title, children, id }: { title: ReactNode; children: ReactNode; id?: string }) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-h` : undefined} className="scroll-mt-24">
      <h2 id={id ? `${id}-h` : undefined} className="mb-3 text-xl sm:text-2xl">
        {title}
      </h2>
      <div className="flex flex-col gap-3 leading-relaxed">{children}</div>
    </section>
  );
}
