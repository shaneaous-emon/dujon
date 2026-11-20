"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Briefcase,
  Building2,
  Globe2,
  GraduationCap,
  Heart,
  Landmark,
  Laptop,
  MapPin,
  Stethoscope,
  Users,
} from "lucide-react";
import { cn } from "@/lib/cn";

type TabKey = "divisions" | "professions" | "education" | "marital";

const TABS: { key: TabKey; Icon: typeof MapPin }[] = [
  { key: "divisions", Icon: MapPin },
  { key: "professions", Icon: Briefcase },
  { key: "education", Icon: GraduationCap },
  { key: "marital", Icon: Heart },
];

const DIVISION_ITEMS = [
  { key: "dhaka", param: "division=1", Icon: Landmark },
  { key: "chattogram", param: "division=2", Icon: MapPin },
  { key: "sylhet", param: "division=3", Icon: MapPin },
  { key: "rajshahi", param: "division=4", Icon: MapPin },
  { key: "khulna", param: "division=5", Icon: MapPin },
  { key: "barishal", param: "division=6", Icon: MapPin },
  { key: "rangpur", param: "division=7", Icon: MapPin },
  { key: "mymensingh", param: "division=8", Icon: MapPin },
  { key: "nrb", param: "area=nrb", Icon: Globe2 },
] as const;

const PROFESSION_ITEMS = [
  { key: "doctor", param: "profession=doctor", Icon: Stethoscope },
  { key: "engineer", param: "profession=engineer", Icon: Laptop },
  { key: "banker", param: "profession=banker", Icon: Landmark },
  { key: "bcs", param: "profession=bcs", Icon: Building2 },
  { key: "teacher", param: "profession=teacher", Icon: GraduationCap },
  { key: "business", param: "profession=business", Icon: Briefcase },
  { key: "it", param: "profession=it", Icon: Laptop },
  { key: "corporate", param: "profession=corporate", Icon: Users },
] as const;

const EDUCATION_ITEMS = [
  { key: "mbbs", param: "education=mbbs", Icon: Stethoscope },
  { key: "bsc", param: "education=bsc", Icon: GraduationCap },
  { key: "mba", param: "education=mba", Icon: Briefcase },
  { key: "masters", param: "education=masters", Icon: GraduationCap },
  { key: "honors", param: "education=honors", Icon: GraduationCap },
  { key: "phd", param: "education=phd", Icon: Globe2 },
] as const;

const MARITAL_ITEMS = [
  { key: "neverMarried", param: "marital=never_married", Icon: Heart },
  { key: "divorced", param: "marital=divorced", Icon: Users },
  { key: "widowed", param: "marital=widowed", Icon: Users },
] as const;

export function HomeCategories() {
  const t = useTranslations("home.categories");
  const locale = useLocale();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("divisions");

  function handleSelect(param: string) {
    const loggedIn = document.cookie.split("; ").some((cookie) => cookie.startsWith("dujon_in="));
    const searchPath = `/search?${param}`;
    const target = loggedIn ? searchPath : `/register?next=${encodeURIComponent(searchPath)}`;
    router.push(locale === "en" ? `/en${target}` : target);
  }

  const items =
    activeTab === "divisions"
      ? DIVISION_ITEMS
      : activeTab === "professions"
        ? PROFESSION_ITEMS
        : activeTab === "education"
          ? EDUCATION_ITEMS
          : MARITAL_ITEMS;

  return (
    <div>
      <div
        role="tablist"
        aria-label={t("tabsLabel")}
        className="mb-8 flex flex-wrap justify-center gap-2.5"
      >
        {TABS.map(({ key, Icon }) => {
          const selected = activeTab === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveTab(key)}
              className={cn(
                "inline-flex min-h-11 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 sm:text-base",
                selected
                  ? "bg-accent text-white shadow-md ring-2 ring-[#c6923a]/40"
                  : "border-border bg-surface text-text-muted hover:border-accent/40 hover:text-accent border",
              )}
            >
              <Icon aria-hidden="true" className="size-4" />
              {t(`tabs.${key}` as never)}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        className="grid gap-3.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      >
        {items.map(({ key, param, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => handleSelect(param)}
            className="group border-border bg-surface hover:border-accent/40 shadow-card flex min-h-[4.5rem] items-center justify-between gap-3 rounded-2xl border px-5 py-4 text-start transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <span className="flex items-center gap-3.5">
              <span className="bg-accent-soft text-accent group-hover:bg-accent inline-flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-200 group-hover:text-white">
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <span className="font-semibold transition-colors group-hover:text-accent">
                {t(`${activeTab}.${key}` as never)}
              </span>
            </span>
            <ArrowRight
              aria-hidden="true"
              className="text-text-muted size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-accent"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
