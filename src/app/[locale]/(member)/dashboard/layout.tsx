import { DashboardNav } from "@/components/layout/member-nav";

export default function DashboardLayout({ children }: LayoutProps<"/[locale]">) {
  return (
    <div className="grid gap-6 lg:grid-cols-[14rem_1fr]">
      <div className="hidden lg:block lg:sticky lg:top-20 lg:self-start">
        <DashboardNav />
      </div>
      <div className="lg:hidden">
        <DashboardNav />
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
