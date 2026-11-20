import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PreferencesForm } from "@/components/features/profile-forms";
import { Card } from "@/components/ui";
import { ageFromDobString } from "@/lib/dates";
import { requireUser } from "@/server/guards";
import { getLocationTree } from "@/server/locations";
import { getOwnProfile, getPreferences } from "@/server/services/profiles";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function PreferencesPage({ params }: PageProps<"/[locale]/dashboard/preferences">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireUser("/dashboard/preferences");
  const p = await getOwnProfile(user.id);
  const t = await getTranslations("preferences");
  if (!p) return null;
  const prefs = await getPreferences(user.id, ageFromDobString(p.dateOfBirth));
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl sm:text-3xl">{t("title")}</h1>
      <Card>
        <PreferencesForm mode="edit" data={await getLocationTree()} initial={prefs} />
      </Card>
    </div>
  );
}
