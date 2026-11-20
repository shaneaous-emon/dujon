import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { InterestActions, type InterestUi } from "@/components/features/interest-actions";
import { ProfilePhoto } from "@/components/features/profile-photo";
import { Badge, buttonClasses, EmptyState } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { requireUser } from "@/server/guards";
import { listInterests } from "@/server/services/interests";
import { cardsForUserIds } from "@/server/services/profiles";

export const metadata: Metadata = { robots: { index: false, follow: false } };
const TABS = ["received", "sent", "connections"] as const;

export default async function InterestsPage({ params, searchParams }: PageProps<"/[locale]/dashboard/interests">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const user = await requireUser("/dashboard/interests");
  const t = await getTranslations("interests");
  const c = await getTranslations("common");
  const lc = (await getLocale()) as "bn" | "en";
  const tab = (TABS as readonly string[]).includes(String(sp.tab)) ? (sp.tab as (typeof TABS)[number]) : "received";
  const list = await listInterests(user.id, tab);
  const cards = await cardsForUserIds(user.id, list.map((i) => i.otherUserId));
  const df = new Intl.DateTimeFormat(lc === "bn" ? "bn-BD" : "en-GB", { dateStyle: "medium", timeZone: "Asia/Dhaka" });
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl sm:text-3xl">{t("title")}</h1>
      <nav aria-label={t("title")} className="border-border flex gap-1 border-b">
        {TABS.map((k) => (
          <Link
            key={k}
            href={{ pathname: "/dashboard/interests", query: { tab: k } }}
            aria-current={tab === k ? "page" : undefined}
            className={cn("min-h-11 px-4 py-2 font-semibold", tab === k ? "border-accent text-accent border-b-2" : "text-text-muted")}
          >
            {t(`tabs.${k}` as never)}
          </Link>
        ))}
      </nav>
      {list.length === 0 ? (
        <EmptyState title={t(`empty.${tab}` as never)} action={tab === "sent" ? <Link href="/search" className={buttonClasses({})}>{(await getTranslations("nav"))("search")}</Link> : undefined} />
      ) : (
        <ul className="flex flex-col gap-4">
          {list.map((i) => {
            const card = cards.get(i.otherUserId);
            if (!card) return null;
            const ui: InterestUi =
              tab === "received" ? { kind: "received", interestId: i.interestId } : tab === "sent" && i.status === "pending" ? { kind: "sent", interestId: i.interestId } : tab === "connections" ? { kind: "connected", interestId: i.interestId } : { kind: "none" };
            return (
              <li key={i.interestId} className="border-border bg-surface shadow-card flex gap-4 rounded-lg border p-4">
                <Link href={`/profiles/${card.publicId}`} className="w-24 shrink-0 sm:w-32">
                  <ProfilePhoto name={card.displayName} photoPublicId={card.photoPublicId} visible={card.photoVisibility === "members" || card.connected} className="rounded-md" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Link href={`/profiles/${card.publicId}`} className="text-lg font-semibold underline-offset-4 hover:underline">
                    {card.displayName}{", "}{c("yearsOld", { age: card.age })}
                  </Link>
                  <p className="text-text-muted text-sm">{t("date", { date: df.format(new Date(i.at)) })}</p>
                  {tab === "sent" && i.status === "declined" ? <Badge tone="warning">{t("declinedStatus")}</Badge> : null}
                  {tab === "sent" && i.status === "pending" ? <Badge>{t("pendingStatus")}</Badge> : null}
                  {tab === "connections" ? (
                    <Link href={`/profiles/${card.publicId}`} className={buttonClasses({ variant: "secondary", className: "w-fit" })}>
                      {t("viewContact")}
                    </Link>
                  ) : null}
                  {tab === "received" || (tab === "sent" && i.status === "pending") ? (
                    <InterestActions publicId={card.publicId} name={card.displayName} state={ui} canSend emailVerified={user.emailVerified} />
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
