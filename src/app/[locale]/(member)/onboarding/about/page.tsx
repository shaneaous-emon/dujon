import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AboutForm } from "@/components/features/profile-forms";
import { Stepper } from "@/components/features/stepper";
import { aboutInitial } from "@/lib/onboarding-data";
import { requireUser } from "@/server/guards";
import { getOwnProfile } from "@/server/services/profiles";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function OnboardingAbout({ params }: PageProps<"/[locale]/onboarding/about">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireUser("/onboarding/about");
  const p = await getOwnProfile(user.id);
  const t = await getTranslations("onboarding");
  if (!p) return null;
  return (
    <>
      <Stepper current="about" />
      <h1 className="mb-6 text-2xl">{t("about.title")}</h1>
      <AboutForm mode="onboarding" initial={aboutInitial(p)} />
    </>
  );
}
