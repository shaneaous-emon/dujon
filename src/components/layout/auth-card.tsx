import type { ReactNode } from "react";

export function AuthCard({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <div className="border-border bg-surface shadow-card rounded-xl border p-6 sm:p-8">
      <h1 className="mb-6 text-2xl">{title}</h1>
      {children}
    </div>
  );
}
