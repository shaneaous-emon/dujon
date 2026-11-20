import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AboutForm, LocationForm, PhotoForm, PublishForm } from "@/components/features/profile-forms";
import { Alert, buttonClasses, Card } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { aboutInitial } from "@/lib/onboarding-data";
import { requireUser } from "@/server/guards";
import { getLocationTree } from "@/server/locations";
import { getOwnProfile, missingForPublish } from "@/server/services/profiles";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function EditProfilePage({ params, searchParams }: PageProps<"/[locale]/dashboard/profile">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const user = await requireUser("/dashboard/profile");
  const p = await getOwnProfile(user.id);
  const t = await getTranslations("profile");
  const n = await getTranslations("nav");
  if (!p) return null;
  const missing = missingForPublish(p);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl">{n("myProfile")}</h1>
        <Link href={`/profiles/${p.publicId}`} className={buttonClasses({ variant: "secondary" })}>
          {t("preview")}
        </Link>
      </div>
      {sp.published === "1" ? <Alert tone="success">{t("published")}</Alert> : null}
      <Card aria-labelledby="sec-vis">
        <h2 id="sec-vis" className="mb-3 text-xl">
          {t("editSection.visibility")}
        </h2>
        <PublishForm from="dashboard" status={p.status} disabled={missing.length > 0} />
      </Card>
      <Card aria-labelledby="sec-basics">
        <h2 id="sec-basics" className="mb-4 text-xl">
          {t("editSection.basics")}
        </h2>
        <p className="text-text-muted mb-4 text-sm">
          {t("genderLabel")}: {t(`gender.${p.gender}` as never)} · {t("age")}: {p.age}{". "}{t("lockedFields")}
        </p>
        <AboutForm mode="edit" initial={aboutInitial(p)} />
      </Card>
      <Card aria-labelledby="sec-loc">
        <h2 id="sec-loc" className="mb-4 text-xl">
          {t("editSection.location")}
        </h2>
        <LocationForm mode="edit" data={await getLocationTree()} initial={{ divisionId: p.divisionId, districtId: p.districtId, upazilaId: p.upazilaId }} />
      </Card>
      <Card aria-labelledby="sec-photo">
        <h2 id="sec-photo" className="mb-4 text-xl">
          {t("editSection.photo")}
        </h2>
        <PhotoForm mode="edit" current={{ name: p.displayName, hasPhoto: Boolean(p.photoPublicId), url: p.photoPublicId ? `/api/photos/${p.photoPublicId}?size=full` : null }} visibility={p.photoVisibility} />
      </Card>
    </div>
  );
}
