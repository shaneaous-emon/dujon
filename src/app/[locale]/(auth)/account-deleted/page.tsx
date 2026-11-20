import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthCard } from "@/components/layout/auth-card";
import { Alert, buttonClasses } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/account-deleted">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return buildMetadata({ locale, path: "/account-deleted", title: t("accountDeleted"), index: false });
}

export default async function AccountDeletedPage({ params }: PageProps<"/[locale]/account-deleted">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("deleteAccount");
  const n = await getTranslations("nav");
  return (
    <AuthCard title={t("doneTitle")}>
      <div className="flex flex-col gap-4">
        <Alert tone="success">{t("done")}</Alert>
        <Link href="/" className={buttonClasses({ variant: "secondary" })}>
          {n("home")}
        </Link>
      </div>
    </AuthCard>
  );
}
