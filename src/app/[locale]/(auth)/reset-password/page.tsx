import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ResetForm } from "@/components/features/auth-forms";
import { AuthCard } from "@/components/layout/auth-card";
import { Alert, buttonClasses } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { buildMetadata } from "@/lib/seo";
import { one } from "@/server/db";
import { sha256Hex } from "@/server/crypto";

export async function generateMetadata({ params }: PageProps<"/[locale]/reset-password">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { ...buildMetadata({ locale, path: "/reset-password", title: t("reset"), index: false }), referrer: "no-referrer" };
}

export default async function ResetPage({ params, searchParams }: PageProps<"/[locale]/reset-password">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const token = typeof sp.token === "string" ? sp.token : "";
  const t = await getTranslations("auth.reset");
  const valid = token
    ? await one("SELECT id FROM auth_tokens WHERE token_hash=? AND type='password_reset' AND used_at IS NULL AND expires_at > NOW(3)", [sha256Hex(token)])
    : null;
  return (
    <AuthCard title={t("title")}>
      {valid ? (
        <ResetForm token={token} />
      ) : (
        <div className="flex flex-col gap-4">
          <Alert tone="danger">{t("invalid")}</Alert>
          <Link href="/forgot-password" className={buttonClasses({})}>
            {t("requestNew")}
          </Link>
        </div>
      )}
    </AuthCard>
  );
}
