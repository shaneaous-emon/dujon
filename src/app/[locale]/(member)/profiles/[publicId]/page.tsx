import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Briefcase, GraduationCap, MapPin, Ruler, Phone, Mail } from "lucide-react";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { InterestActions, type InterestUi } from "@/components/features/interest-actions";
import { ProfilePhoto } from "@/components/features/profile-photo";
import { BlockDialog, ReportDialog } from "@/components/features/safety-menu";
import { SaveButton } from "@/components/features/save-button";
import { Alert, Badge, buttonClasses, Card } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { ageFromDobString } from "@/lib/dates";
import { cmToFeetInches } from "@/lib/profile-options";
import { requireUser } from "@/server/guards";
import { getLocationTree, placeName } from "@/server/locations";
import { canSeePhoto, canViewProfile, getViewer } from "@/server/services/policies";
import { getInterestState, getContactIfConnected } from "@/server/services/interests";
import { getPreferences, getProfileByPublicId } from "@/server/services/profiles";
import { listSavedUserIds } from "@/server/services/safety";
import { one } from "@/server/db";

export const metadata: Metadata = { robots: { index: false, follow: false }, title: "Profile" };

export default async function ProfilePage({ params }: PageProps<"/[locale]/profiles/[publicId]">) {
  const { locale, publicId } = await params;
  setRequestLocale(locale);
  const user = await requireUser(`/profiles/${publicId}`);
  const target = await getProfileByPublicId(publicId);
  if (!target) notFound();
  const viewer = await getViewer(user.id, user.emailVerified);
  if (!viewer) notFound();
  const active = await one<{ status: string }>("SELECT status FROM users WHERE id=?", [target.userId]);
  const decision = await canViewProfile(viewer, target, active?.status === "active");
  if (decision === "denied") notFound();

  const t = await getTranslations("profile");
  const d = await getTranslations("profileDetail");
  const c = await getTranslations("common");
  const ci = await getTranslations("contact");
  const ph = await getTranslations("photo");
  const sr = await getTranslations("search");
  const lc = (await getLocale()) as "bn" | "en";
  const tree = await getLocationTree();
  const isSelf = decision === "self";
  const age = ageFromDobString(target.dateOfBirth);
  const place = placeName(tree, lc, { divisionId: target.divisionId ?? undefined, districtId: target.districtId ?? undefined, upazilaId: target.upazilaId ?? undefined });
  const photoVisible = await canSeePhoto(user.id, target.userId, target.photoVisibility);
  const prefs = await getPreferences(target.userId, age);
  const prefPlace = placeName(tree, lc, { divisionId: prefs.divisionId ?? undefined, districtId: prefs.districtId ?? undefined, upazilaId: prefs.upazilaId ?? undefined });

  const istate = isSelf ? ({ kind: "none" } as const) : await getInterestState(user.id, target.userId);
  const contact = !isSelf && istate.kind === "connected" ? await getContactIfConnected(user.id, target.userId) : null;
  const saved = isSelf ? false : (await listSavedUserIds(user.id)).includes(target.userId);
  const ownPublished = viewer.profileStatus === "published";
  const retryLabel =
    istate.kind === "declined" ? new Intl.DateTimeFormat(lc === "bn" ? "bn-BD" : "en-GB", { dateStyle: "long", timeZone: "Asia/Dhaka" }).format(new Date(istate.retryAfter)) : undefined;
  const ui: InterestUi = istate;

  const height = target.heightCm ? cmToFeetInches(target.heightCm) : null;
  const facts: { Icon: typeof MapPin; label: string; value: string }[] = [];
  if (place) facts.push({ Icon: MapPin, label: t("location"), value: place });
  if (target.maritalStatus) facts.push({ Icon: Briefcase, label: t("maritalStatus"), value: t(`marital.${target.maritalStatus}` as never) });
  if (height) facts.push({ Icon: Ruler, label: t("height"), value: t("heightValue", { feet: height.feet, inches: height.inches }) });
  if (target.educationLevel)
    facts.push({ Icon: GraduationCap, label: t("educationLevel"), value: [t(`edu.${target.educationLevel}` as never), target.educationDetail].filter(Boolean).join(" — ") });
  if (target.occupation) facts.push({ Icon: Briefcase, label: t("occupation"), value: target.occupation });

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      {isSelf ? (
        <Alert tone="info">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{d("previewBanner")}</span>
            <Link href="/dashboard/profile" className={buttonClasses({ variant: "secondary" })}>
              {c("edit")}
            </Link>
          </div>
        </Alert>
      ) : (
        <Link href="/search" className="text-accent w-fit font-semibold underline">
          {"← "}{d("back")}
        </Link>
      )}
      {decision === "ok-hidden" ? <Alert tone="warning">{d("hiddenSender")}</Alert> : null}
      <div className="grid gap-6 md:grid-cols-[18rem_1fr]">
        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-lg">
            <ProfilePhoto name={target.displayName} photoPublicId={target.photoPublicId} visible={photoVisible} size="full" priority />
          </div>
          {!photoVisible && target.photoPublicId ? <p className="text-text-muted text-sm">{ph("hiddenForNow")}</p> : null}
        </div>
        <div className="flex flex-col gap-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl">
                {target.displayName}
                <span className="text-text-muted font-normal">{", "}{c("yearsOld", { age })}</span>
              </h1>
              {target.createdBy !== "self" ? <Badge className="mt-2">{t("managedBadge", { relation: t(`createdBy.${target.createdBy}` as never) })}</Badge> : null}
            </div>
            {!isSelf ? <SaveButton publicId={target.publicId} name={target.displayName} saved={saved} withLabel /> : null}
          </div>

          {!isSelf ? (
            <Card>
              <InterestActions publicId={target.publicId} name={target.displayName} state={ui} canSend={ownPublished} emailVerified={user.emailVerified} retryLabel={retryLabel} />
            </Card>
          ) : null}

          {contact ? (
            <Card aria-labelledby="contact-h">
              <h2 id="contact-h" className="mb-3 text-xl">
                {ci("title")}
              </h2>
              <ul className="flex flex-col gap-2">
                <li className="flex items-center gap-2">
                  <Mail aria-hidden="true" className="text-accent size-5" />
                  <span className="text-text-muted">{ci("email")}:</span>
                  <a className="font-semibold underline" href={`mailto:${contact.email}`}>
                    {contact.email}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone aria-hidden="true" className="text-accent size-5" />
                  <span className="text-text-muted">{ci("mobile")}:</span>
                  {contact.mobile ? (
                    <a className="font-semibold underline" href={`tel:${contact.mobile}`} dir="ltr">
                      {contact.mobile}
                    </a>
                  ) : (
                    <span>{ci("noMobile")}</span>
                  )}
                </li>
              </ul>
              <Alert tone="warning" className="mt-4">
                <span>{ci("safety")} </span>
                <Link href="/safety" className="font-semibold underline">
                  {ci("safetyLink")}
                </Link>
              </Alert>
            </Card>
          ) : null}

          <Card aria-labelledby="basics-h">
            <h2 id="basics-h" className="mb-3 text-xl">
              {d("basics")}
            </h2>
            <dl className="grid gap-3 sm:grid-cols-2">
              {facts.map(({ Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <Icon aria-hidden="true" className="text-accent mt-1 size-5 shrink-0" />
                  <div>
                    <dt className="text-text-muted text-sm">{label}</dt>
                    <dd className="font-medium">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </Card>

          {target.about ? (
            <Card aria-labelledby="about-h">
              <h2 id="about-h" className="mb-2 text-xl">
                {d("about")}
              </h2>
              <p className="whitespace-pre-line">{target.about}</p>
            </Card>
          ) : null}
          {target.familyInfo ? (
            <Card aria-labelledby="family-h">
              <h2 id="family-h" className="mb-2 text-xl">
                {d("family")}
              </h2>
              <p className="whitespace-pre-line">{target.familyInfo}</p>
            </Card>
          ) : null}
          {prefs.saved ? (
            <Card aria-labelledby="looking-h">
              <h2 id="looking-h" className="mb-2 text-xl">
                {d("lookingFor")}
              </h2>
              <p>{d("lookingForValue", { min: prefs.ageMin, max: prefs.ageMax, area: prefPlace || sr("anyArea") })}</p>
            </Card>
          ) : null}

          {!isSelf ? (
            <div className="border-border flex flex-wrap gap-2 border-t pt-4" role="group" aria-label={d("actions")}>
              <ReportDialog publicId={target.publicId} />
              <BlockDialog publicId={target.publicId} name={target.displayName} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
