import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { RegisterForm } from "@/components/features/auth-forms";
import { AuthCard } from "@/components/layout/auth-card";
import { todayInDhaka } from "@/lib/dates";
import { redirectIfLoggedIn } from "@/server/guards";
import { safeNext } from "@/actions/types";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/register">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return buildMetadata({ locale, path: "/register", title: t("register"), index: false });
}

export default async function RegisterPage({ params, searchParams }: PageProps<"/[locale]/register">) {
  const { locale } = await params;
  setRequestLocale(locale);
  await redirectIfLoggedIn();
  const sp = await searchParams;
  const next = safeNext(typeof sp.next === "string" ? sp.next : null) ?? undefined;
  const t = await getTranslations("auth.register");
  return (
    <AuthCard title={t("title")}>
      {next ? <p className="text-text-muted mb-4 text-sm">{t("nextNote")}</p> : null}
      <RegisterForm currentYear={todayInDhaka().y} next={next} />
    </AuthCard>
  );
}
