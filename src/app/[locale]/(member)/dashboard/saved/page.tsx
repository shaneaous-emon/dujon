import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProfileCard } from "@/components/features/profile-card";
import { buttonClasses, EmptyState } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { requireUser } from "@/server/guards";
import { cardsForUserIds } from "@/server/services/profiles";
import { listSavedUserIds } from "@/server/services/safety";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function SavedPage({ params }: PageProps<"/[locale]/dashboard/saved">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireUser("/dashboard/saved");
  const t = await getTranslations("saved");
  const n = await getTranslations("nav");
  const ids = await listSavedUserIds(user.id);
  const cards = await cardsForUserIds(user.id, ids);
  const ordered = ids.map((i) => cards.get(i)).filter((c): c is NonNullable<typeof c> => Boolean(c));
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl sm:text-3xl">{t("title")}</h1>
      {ordered.length === 0 ? (
        <EmptyState title={t("empty")} action={<Link href="/search" className={buttonClasses({})}>{n("search")}</Link>} />
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
          {ordered.map((c) => (
            <li key={c.publicId}>
              <ProfileCard card={c} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
