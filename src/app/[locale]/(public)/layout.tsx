import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { todayInDhaka } from "@/lib/dates";

export default function PublicLayout({ children }: LayoutProps<"/[locale]">) {
  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="min-h-[60dvh]">
        {children}
      </main>
      <SiteFooter year={todayInDhaka().y} />
    </>
  );
}
