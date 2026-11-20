import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { ProfileCard } from "@/components/features/profile-card";
import { SearchFilters, type FilterValues } from "@/components/features/search-filters";
import { Alert, buttonClasses, EmptyState } from "@/components/ui";
import { appConfig } from "@/config/app";
import { Link } from "@/i18n/navigation";
import { ageFromDobString } from "@/lib/dates";
import { buildMetadata } from "@/lib/seo";
import { requireUser } from "@/server/guards";
import { getLocationTree, placeName } from "@/server/locations";
import { getOwnProfile, getPreferences, searchProfiles } from "@/server/services/profiles";

export async function generateMetadata({ params }: PageProps<"/[locale]/search">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return buildMetadata({ locale, path: "/search", title: t("search"), index: false });
}

const num = (v: string | string[] | undefined): number | null => {
  const s = Array.isArray(v) ? v[0] : v;
  const n = s ? Number(s) : NaN;
  return Number.isInteger(n) && n > 0 ? n : null;
};

export default async function SearchPage({ params, searchParams }: PageProps<"/[locale]/search">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const user = await requireUser("/search");
  const profile = await getOwnProfile(user.id);
  const t = await getTranslations("search");
  const lc = (await getLocale()) as "bn" | "en";
  if (!profile) return null;
  if (profile.status !== "published" && profile.status !== "hidden") {
    return (
      <EmptyState
        title={t("publishFirst")}
        action={
          <Link href="/onboarding/about" className={buttonClasses({})}>
            {t("publishFirstCta")}
          </Link>
        }
      />
    );
  }

  const prefs = await getPreferences(user.id, ageFromDobString(profile.dateOfBirth));
  const hasParams = ["age_min", "age_max", "division", "district", "upazila"].some((k) => sp[k] !== undefined);
  const clamp = (n: number | null, d: number) => Math.min(appConfig.searchAgeMaxBound, Math.max(appConfig.searchAgeMinBound, n ?? d));
  let ageMin = clamp(num(sp.age_min), hasParams ? appConfig.searchAgeMinBound : prefs.ageMin);
  let ageMax = clamp(num(sp.age_max), hasParams ? appConfig.searchAgeMaxBound : prefs.ageMax);
  if (ageMin > ageMax) [ageMin, ageMax] = [ageMax, ageMin];
  const values: FilterValues = {
    ageMin,
    ageMax,
    divisionId: hasParams ? num(sp.division) : prefs.divisionId,
    districtId: hasParams ? num(sp.district) : prefs.districtId,
    upazilaId: hasParams ? num(sp.upazila) : prefs.upazilaId,
  };
  // keep the hierarchy consistent: deeper level wins
  const tree = await getLocationTree();
  if (values.upazilaId) {
    const u = tree.upazilas.find((x) => x.id === values.upazilaId);
    if (u) {
      values.districtId = u.districtId;
      values.divisionId = tree.districts.find((d) => d.id === u.districtId)?.divisionId ?? values.divisionId;
    } else values.upazilaId = null;
  }
  if (values.districtId && !values.upazilaId) {
    const d = tree.districts.find((x) => x.id === values.districtId);
    if (d) values.divisionId = d.divisionId;
    else values.districtId = null;
  }

  const page = num(sp.page) ?? 1;
  const result = await searchProfiles(user.id, profile.gender, { ...values, page });
  const place = placeName(tree, lc, { divisionId: values.divisionId ?? undefined, districtId: values.districtId ?? undefined, upazilaId: values.upazilaId ?? undefined });
  const nf = new Intl.NumberFormat(lc === "bn" ? "bn-BD" : "en", { useGrouping: false });
  const activeCount = (values.divisionId ? 1 : 0) + 1;
  const query = (p: number) => {
    const q: Record<string, string> = { age_min: String(values.ageMin), age_max: String(values.ageMax), page: String(p) };
    if (values.divisionId) q.division = String(values.divisionId);
    if (values.districtId) q.district = String(values.districtId);
    if (values.upazilaId) q.upazila = String(values.upazilaId);
    return q;
  };
  const noFilters = !values.divisionId && values.ageMin === appConfig.searchAgeMinBound && values.ageMax === appConfig.searchAgeMaxBound;

  return (
    <div className="flex flex-col gap-5">
      {sp.welcome === "1" ? <Alert tone="success">{t("welcome")}</Alert> : null}
      {profile.status === "hidden" ? <Alert tone="warning">{(await getTranslations("profile"))("hideHelp")}</Alert> : null}
      <div>
        <h1 className="text-2xl sm:text-3xl">{t("title")}</h1>
        <p className="text-text-muted mt-1" aria-live="polite">
          {t("results", { count: result.total })} · {nf.format(values.ageMin)}–{nf.format(values.ageMax)}
          {place ? ` · ${place}` : ""}
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
        <div>
          <SearchFilters data={tree} values={values} activeCount={activeCount} />
        </div>
        <section aria-label={t("title")}>
          {result.items.length === 0 ? (
            <EmptyState title={noFilters ? t("coldStart") : t("empty.title")} body={noFilters ? undefined : t("empty.body")} />
          ) : (
            <>
              <ul className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
                {result.items.map((c, i) => (
                  <li key={c.publicId}>
                    <ProfileCard card={c} priority={i < 4} />
                  </li>
                ))}
              </ul>
              {result.totalPages > 1 ? (
                <nav aria-label={t("pagination")} className="mt-8 flex items-center justify-between gap-3">
                  {result.page > 1 ? (
                    <Link href={{ pathname: "/search", query: query(result.page - 1) }} className={buttonClasses({ variant: "secondary" })}>
                      {t("prev")}
                    </Link>
                  ) : (
                    <span />
                  )}
                  <span className="text-text-muted text-sm">{t("pageOf", { page: result.page, total: result.totalPages })}</span>
                  {result.page < result.totalPages ? (
                    <Link href={{ pathname: "/search", query: query(result.page + 1) }} className={buttonClasses({ variant: "secondary" })}>
                      {t("next")}
                    </Link>
                  ) : (
                    <span />
                  )}
                </nav>
              ) : null}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

