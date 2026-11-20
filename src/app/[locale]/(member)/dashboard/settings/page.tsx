import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { logoutAllAction } from "@/actions/account";
import { LanguageSwitcher } from "@/components/features/language-switcher";
import { PasswordForm, SettingsForm } from "@/components/features/settings-forms";
import { UnblockButton } from "@/components/features/safety-menu";
import { buttonClasses, Card } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { requireUser } from "@/server/guards";
import { listBlocked } from "@/server/services/safety";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function SettingsPage({ params }: PageProps<"/[locale]/dashboard/settings">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireUser("/dashboard/settings");
  const t = await getTranslations("settings");
  const blocked = await listBlocked(user.id);
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl sm:text-3xl">{t("title")}</h1>
      <Card>
        <h2 className="mb-3 text-xl">{t("language")}</h2>
        <LanguageSwitcher />
      </Card>
      <Card>
        <SettingsForm email={user.email} mobile={user.mobile ?? ""} notifyReceived={user.notifyReceived} notifyAccepted={user.notifyAccepted} />
      </Card>
      <Card>
        <h2 className="mb-4 text-xl">{t("password")}</h2>
        <PasswordForm />
      </Card>
      <Card>
        <h2 className="mb-3 text-xl">{t("blocked")}</h2>
        {blocked.length === 0 ? (
          <p className="text-text-muted">{t("blockedEmpty")}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {blocked.map((b) => (
              <li key={b.publicId} className="flex items-center justify-between gap-3">
                <span className="font-medium">{b.displayName}</span>
                <UnblockButton publicId={b.publicId} />
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card>
        <form action={logoutAllAction}>
          <button type="submit" className={buttonClasses({ variant: "secondary" })}>
            {t("logoutAll")}
          </button>
        </form>
      </Card>
      <Card className="border-danger/40">
        <h2 className="text-danger mb-2 text-xl">{t("danger")}</h2>
        <p className="text-text-muted mb-4">{t("dangerBody")}</p>
        <Link href="/dashboard/delete-account" className={buttonClasses({ variant: "danger" })}>
          {t("danger")}
        </Link>
      </Card>
    </div>
  );
}
