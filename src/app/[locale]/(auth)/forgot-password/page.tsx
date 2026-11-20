import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ForgotForm } from "@/components/features/auth-forms";
import { AuthCard } from "@/components/layout/auth-card";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/forgot-password">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return buildMetadata({ locale, path: "/forgot-password", title: t("forgot"), index: false });
}

export default async function ForgotPage({ params }: PageProps<"/[locale]/forgot-password">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth.forgot");
  return (
    <AuthCard title={t("title")}>
      <p className="text-text-muted mb-5">{t("body")}</p>
      <ForgotForm />
    </AuthCard>
  );
}
