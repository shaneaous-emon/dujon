import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { PublishForm } from "@/components/features/profile-forms";
import { Stepper } from "@/components/features/stepper";
import { Alert, buttonClasses, Card } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { requireUser } from "@/server/guards";
import { getLocationTree, placeName } from "@/server/locations";
import { getOwnProfile, missingForPublish } from "@/server/services/profiles";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function OnboardingReview({ params }: PageProps<"/[locale]/onboarding/review">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireUser("/onboarding/review");
  const p = await getOwnProfile(user.id);
  const t = await getTranslations("onboarding");
  const pr = await getTranslations("profile");
  const c = await getTranslations("common");
  const lc = (await getLocale()) as "bn" | "en";
  if (!p) return null;
  const missing = missingForPublish(p);
  const place = placeName(await getLocationTree(), lc, { divisionId: p.divisionId ?? undefined, districtId: p.districtId ?? undefined, upazilaId: p.upazilaId ?? undefined });
  const stepFor: Record<string, string> = { displayName: "about", maritalStatus: "about", educationLevel: "about", occupation: "about", about: "about", location: "location" };
  return (
    <>
      <Stepper current="review" />
      <h1 className="mb-2 text-2xl">{t("review")}</h1>
      <p className="text-text-muted mb-6">{t("reviewHelp")}</p>
      {missing.length ? (
        <Alert tone="warning" title={pr("checklist.title")} className="mb-5">
          <ul className="ms-5 mt-2 list-disc">
            {missing.map((m) => (
              <li key={m}>
                <Link href={`/onboarding/${stepFor[m]}`} className="font-semibold underline">
                  {pr(`checklist.${m}` as never)}
                </Link>
              </li>
            ))}
          </ul>
        </Alert>
      ) : null}
      <Card className="mb-6">
        <h2 className="text-xl">
          {p.displayName}
          <span className="text-text-muted font-normal">{", "}{c("yearsOld", { age: p.age })}</span>
        </h2>
        <dl className="mt-3 grid gap-2 text-sm">
          <Row k={pr("location")} v={place} />
          <Row k={pr("maritalStatus")} v={p.maritalStatus ? pr(`marital.${p.maritalStatus}` as never) : ""} />
          <Row k={pr("educationLevel")} v={p.educationLevel ? pr(`edu.${p.educationLevel}` as never) : ""} />
          <Row k={pr("occupation")} v={p.occupation ?? ""} />
        </dl>
        {p.about ? <p className="mt-3 whitespace-pre-line">{p.about}</p> : null}
        <Link href="/onboarding/about" className={buttonClasses({ variant: "secondary", className: "mt-4" })}>
          {t("editStep")}
        </Link>
      </Card>
      <PublishForm from="onboarding" status={p.status} disabled={missing.length > 0} />
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  if (!v) return null;
  return (
    <div className="flex gap-2">
      <dt className="text-text-muted w-32 shrink-0">{k}</dt>
      <dd className="font-medium">{v}</dd>
    </div>
  );
}
