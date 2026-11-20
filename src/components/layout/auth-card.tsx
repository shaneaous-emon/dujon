import type { ReactNode } from "react";

export function AuthCard({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <div className="border-border bg-surface shadow-card overflow-hidden rounded-2xl border">
      <div className="bg-gradient-to-r from-[#7a1f33] via-[#c6923a] to-[#7a1f33] h-1.5 w-full" aria-hidden="true" />
      <div className="p-6 sm:p-8">
        <h1 className="mb-6 text-2xl sm:text-3xl">{title}</h1>
        {children}
      </div>
    </div>
  );
}
