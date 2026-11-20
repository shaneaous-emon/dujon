import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PhotoForm } from "@/components/features/profile-forms";
import { Stepper } from "@/components/features/stepper";
import { Link } from "@/i18n/navigation";
import { requireUser } from "@/server/guards";
import { getOwnProfile } from "@/server/services/profiles";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function OnboardingPhoto({ params }: PageProps<"/[locale]/onboarding/photo">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireUser("/onboarding/photo");
  const p = await getOwnProfile(user.id);
  const t = await getTranslations("onboarding");
  const c = await getTranslations("common");
  if (!p) return null;
  return (
    <>
      <Stepper current="photo" />
      <h1 className="mb-6 text-2xl">{t("photo.title")}</h1>
      <PhotoForm
        mode="onboarding"
        current={{ name: p.displayName, hasPhoto: Boolean(p.photoPublicId), url: p.photoPublicId ? `/api/photos/${p.photoPublicId}?size=full` : null }}
        visibility={p.photoVisibility}
      />
      <p className="mt-6">
        <Link href="/onboarding/location" className="text-accent font-semibold underline">
          {"← "}{c("back")}
        </Link>
      </p>
    </>
  );
}
