import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LocationForm } from "@/components/features/profile-forms";
import { Stepper } from "@/components/features/stepper";
import { Link } from "@/i18n/navigation";
import { requireUser } from "@/server/guards";
import { getLocationTree } from "@/server/locations";
import { getOwnProfile } from "@/server/services/profiles";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function OnboardingLocation({ params }: PageProps<"/[locale]/onboarding/location">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireUser("/onboarding/location");
  const p = await getOwnProfile(user.id);
  const t = await getTranslations("onboarding");
  const c = await getTranslations("common");
  if (!p) return null;
  return (
    <>
      <Stepper current="location" />
      <h1 className="mb-6 text-2xl">{t("location.title")}</h1>
      <LocationForm mode="onboarding" data={await getLocationTree()} initial={{ divisionId: p.divisionId, districtId: p.districtId, upazilaId: p.upazilaId }} />
      <p className="mt-6">
        <Link href="/onboarding/about" className="text-accent font-semibold underline">
          {"← "}{c("back")}
        </Link>
      </p>
    </>
  );
}
