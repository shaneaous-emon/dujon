import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LoginForm } from "@/components/features/auth-forms";
import { AuthCard } from "@/components/layout/auth-card";
import { redirectIfLoggedIn } from "@/server/guards";
import { safeNext } from "@/actions/types";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/login">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return buildMetadata({ locale, path: "/login", title: t("login"), index: false });
}

export default async function LoginPage({ params, searchParams }: PageProps<"/[locale]/login">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const next = safeNext(typeof sp.next === "string" ? sp.next : null) ?? undefined;
  await redirectIfLoggedIn(next ?? "/dashboard");
  const t = await getTranslations("auth.login");
  return (
    <AuthCard title={t("title")}>
      <LoginForm next={next} resetDone={sp.reset === "1"} />
    </AuthCard>
  );
}
