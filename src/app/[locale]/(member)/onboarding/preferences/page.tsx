import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PreferencesForm } from "@/components/features/profile-forms";
import { Stepper } from "@/components/features/stepper";
import { Link } from "@/i18n/navigation";
import { ageFromDobString } from "@/lib/dates";
import { requireUser } from "@/server/guards";
import { getLocationTree } from "@/server/locations";
import { getOwnProfile, getPreferences } from "@/server/services/profiles";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function OnboardingPreferences({ params }: PageProps<"/[locale]/onboarding/preferences">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireUser("/onboarding/preferences");
  const p = await getOwnProfile(user.id);
  const t = await getTranslations("onboarding");
  const c = await getTranslations("common");
  if (!p) return null;
  const prefs = await getPreferences(user.id, ageFromDobString(p.dateOfBirth));
  return (
    <>
      <Stepper current="preferences" />
      <h1 className="mb-6 text-2xl">{t("preferences.title")}</h1>
      <PreferencesForm mode="onboarding" data={await getLocationTree()} initial={prefs} />
      <p className="mt-6">
        <Link href="/onboarding/photo" className="text-accent font-semibold underline">
          {"← "}{c("back")}
        </Link>
      </p>
    </>
  );
}
