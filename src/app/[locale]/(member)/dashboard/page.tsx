import type { Metadata } from "next";
import { Bookmark, Check, Circle, Heart, Search, UserCheck } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Badge, buttonClasses, Card } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { requireUser } from "@/server/guards";
import { rows } from "@/server/db";
import { countPendingReceived } from "@/server/services/interests";
import { getOwnProfile, missingForPublish } from "@/server/services/profiles";
import { countSaved } from "@/server/services/safety";
import { one } from "@/server/db";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function DashboardPage({ params }: PageProps<"/[locale]/dashboard">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireUser("/dashboard");
  const t = await getTranslations("dashboard");
  const pr = await getTranslations("profile");
  const p = await getOwnProfile(user.id);
  if (!p) return null;
  const [pending, saved] = await Promise.all([countPendingReceived(user.id), countSaved(user.id)]);
  const conn = await one<{ c: number }>("SELECT COUNT(*) AS c FROM interests WHERE status='accepted' AND (sender_id=? OR receiver_id=?)", [user.id, user.id]);
  const prefs = await one("SELECT 1 AS x FROM partner_preferences WHERE user_id=?", [user.id]);
  void rows;
  const missing = missingForPublish(p);
  const items: [string, boolean][] = [
    [t("checklist.basics"), !missing.some((m) => m !== "location")],
    [t("checklist.location"), !missing.includes("location")],
    [t("checklist.photo"), Boolean(p.photoPublicId)],
    [t("checklist.preferences"), Boolean(prefs)],
    [t("checklist.email"), user.emailVerified],
  ];
  const stats = [
    { href: "/dashboard/interests", label: t("pending"), value: pending, Icon: Heart },
    { href: "/dashboard/interests?tab=connections", label: t("connections"), value: conn?.c ?? 0, Icon: UserCheck },
    { href: "/dashboard/saved", label: t("saved"), value: saved, Icon: Bookmark },
  ];
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl sm:text-3xl">{t("greeting", { name: p.displayName })}</h1>
      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map(({ href, label, value, Icon }) => (
          <Link key={href} href={href} className="border-border bg-surface shadow-card hover:bg-surface-muted flex items-center gap-4 rounded-lg border p-4">
            <span className="bg-accent-soft text-accent inline-flex size-12 items-center justify-center rounded-full">
              <Icon aria-hidden="true" className="size-6" />
            </span>
            <span>
              <span className="block text-2xl font-bold">{value}</span>
              <span className="text-text-muted text-sm">{label}</span>
            </span>
          </Link>
        ))}
      </div>
      <Card>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-xl">{t("profileStatus")}</h2>
          <Badge tone={p.status === "published" ? "success" : p.status === "suspended" ? "warning" : "neutral"}>{pr(`status.${p.status}` as never)}</Badge>
        </div>
        <h3 className="mb-2 font-semibold">{t("checklist.title")}</h3>
        <ul className="mb-4 flex flex-col gap-2">
          {items.map(([label, done]) => (
            <li key={label} className="flex items-center gap-2">
              {done ? <Check aria-hidden="true" className="text-success size-5" /> : <Circle aria-hidden="true" className="text-text-muted size-5" />}
              <span>{label}</span>
              <span className="text-text-muted ms-auto text-sm">{done ? t("checklist.done") : t("checklist.todo")}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-3">
          <Link href="/search" className={buttonClasses({})}>
            <Search aria-hidden="true" className="size-5" />
            {t("quick.search")}
          </Link>
          <Link href="/dashboard/profile" className={buttonClasses({ variant: "secondary" })}>
            {t("quick.edit")}
          </Link>
        </div>
      </Card>
    </div>
  );
}
