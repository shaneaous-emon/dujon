import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/features/language-switcher";
import { ResendVerification } from "@/components/features/resend-verification";
import { Logo } from "@/components/layout/logo";
import { MemberTabBar, MemberTopNav } from "@/components/layout/member-nav";
import { Alert } from "@/components/ui";
import { logoutAction } from "@/actions/auth";
import { requireUser } from "@/server/guards";
import { countPendingReceived } from "@/server/services/interests";

export const dynamic = "force-dynamic";

export default async function MemberLayout({ children }: LayoutProps<"/[locale]">) {
  const user = await requireUser("/dashboard");
  const t = await getTranslations("nav");
  const v = await getTranslations("auth.verify");
  const pending = await countPendingReceived(user.id);
  return (
    <div className="flex min-h-dvh flex-col pb-20 md:pb-0">
      <header className="border-border bg-bg/95 sticky top-0 z-30 border-b backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
          <Logo />
          <MemberTopNav pending={pending} />
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <form action={logoutAction}>
              <button type="submit" className="hover:bg-surface-muted min-h-11 rounded-md px-3 font-medium">
                {t("logout")}
              </button>
            </form>
          </div>
        </div>
      </header>
      {!user.emailVerified ? (
        <div className="mx-auto w-full max-w-6xl px-4 pt-4">
          <Alert tone="warning">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>{v("banner")}</span>
              <ResendVerification compact />
            </div>
          </Alert>
        </div>
      ) : null}
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        {children}
      </main>
      <MemberTabBar pending={pending} />
    </div>
  );
}
