import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { consumeVerificationToken } from "@/actions/auth";
import { ResendVerification } from "@/components/features/resend-verification";
import { AuthCard } from "@/components/layout/auth-card";
import { Alert, buttonClasses } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { buildMetadata } from "@/lib/seo";
import { getCurrentUser } from "@/server/auth/session";

export async function generateMetadata({ params }: PageProps<"/[locale]/verify-email">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { ...buildMetadata({ locale, path: "/verify-email", title: t("verify"), index: false }), referrer: "no-referrer" };
}

export default async function VerifyEmailPage({ params, searchParams }: PageProps<"/[locale]/verify-email">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const token = typeof sp.token === "string" ? sp.token : "";
  const t = await getTranslations("auth.verify");
  const n = await getTranslations("nav");
  const result = await consumeVerificationToken(token);
  const user = await getCurrentUser();
  return (
    <AuthCard title={t("title")}>
      {result === "ok" ? (
        <div className="flex flex-col gap-4">
          <Alert tone="success">{t("success")}</Alert>
          <p className="text-text-muted text-sm">{t("note")}</p>
          <Link href={user ? "/dashboard" : "/login"} className={buttonClasses({})}>
            {user ? t("continue") : n("login")}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <Alert tone="danger">{t("expired")}</Alert>
          {user ? (
            <ResendVerification />
          ) : (
            <Link href="/login" className={buttonClasses({})}>
              {t("loginFirst")}
            </Link>
          )}
        </div>
      )}
    </AuthCard>
  );
}
