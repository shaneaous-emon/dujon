"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Heart, MapPin, Quote, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";

const STORIES = [
  { id: "1", image: "/images/couple-1.jpg" },
  { id: "2", image: "/images/couple-2.jpg" },
  { id: "3", image: "/images/couple-3.jpg" },
  { id: "4", image: "/images/couple-4.jpg" },
] as const;

export function SuccessStories() {
  const t = useTranslations("home.stories");
  const [activeIndex, setActiveIndex] = useState(0);
  const current = STORIES[activeIndex] ?? STORIES[0];

  function prev() {
    setActiveIndex((i) => (i === 0 ? STORIES.length - 1 : i - 1));
  }
  function next() {
    setActiveIndex((i) => (i === STORIES.length - 1 ? 0 : i + 1));
  }

  return (
    <div className="space-y-8">
      {/* Featured Couple Story Card */}
      <div className="border-border bg-surface shadow-elevated overflow-hidden rounded-3xl border">
        <div className="grid lg:grid-cols-12">
          <div className="relative aspect-[4/3] overflow-hidden lg:col-span-6 lg:aspect-auto lg:min-h-[420px]">
            <Image
              key={current.image}
              src={current.image}
              alt={t(`items.${current.id}.names` as never)}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 hover:scale-105"
              priority={activeIndex === 0}
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#1e1216]/70 via-transparent to-transparent lg:hidden"
              aria-hidden="true"
            />
            <div className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/92 px-3.5 py-1.5 text-xs font-semibold text-accent shadow-md backdrop-blur">
              <Heart aria-hidden="true" className="size-3.5 fill-accent text-accent" />
              {t(`items.${current.id}.date` as never)}
            </div>
          </div>

          <div className="relative flex flex-col justify-between p-7 sm:p-10 lg:col-span-6">
            <div>
              <div className="mb-5 flex items-center justify-between gap-3">
                <span className="bg-gold-soft text-warning inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold">
                  <Sparkles aria-hidden="true" className="size-3.5" />
                  {t("featuredBadge")}
                </span>
                <Quote aria-hidden="true" className="size-9 text-[#c6923a]/35" />
              </div>

              <blockquote className="text-text text-lg leading-relaxed font-medium sm:text-xl">
                {t(`items.${current.id}.quote` as never)}
              </blockquote>

              <div className="mt-7 flex items-center gap-3">
                <div className="bg-accent-soft text-accent inline-flex size-11 items-center justify-center rounded-full">
                  <Heart aria-hidden="true" className="size-5 fill-accent/20" />
                </div>
                <div>
                  <p className="text-lg font-bold">{t(`items.${current.id}.names` as never)}</p>
                  <p className="text-text-muted flex items-center gap-1 text-sm">
                    <MapPin aria-hidden="true" className="size-3.5 text-[#c6923a]" />
                    {t(`items.${current.id}.location` as never)}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-border mt-8 flex items-center justify-between border-t pt-5">
              <div className="flex items-center gap-2">
                {STORIES.map((story, idx) => (
                  <button
                    key={story.id}
                    type="button"
                    aria-label={t(`items.${story.id}.names` as never)}
                    onClick={() => setActiveIndex(idx)}
                    className={cn(
                      "h-2.5 rounded-full transition-all duration-300",
                      idx === activeIndex ? "bg-accent w-8" : "bg-border hover:bg-accent/40 w-2.5",
                    )}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={prev}
                  aria-label={t("prev")}
                  className="border-border hover:border-accent hover:bg-accent-soft hover:text-accent inline-flex size-10 items-center justify-center rounded-full border transition-colors"
                >
                  <ChevronLeft aria-hidden="true" className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label={t("next")}
                  className="border-border hover:border-accent hover:bg-accent-soft hover:text-accent inline-flex size-10 items-center justify-center rounded-full border transition-colors"
                >
                  <ChevronRight aria-hidden="true" className="size-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Couple Cards Strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STORIES.map((story, idx) => {
          const active = idx === activeIndex;
          return (
            <button
              key={story.id}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={cn(
                "group overflow-hidden rounded-2xl border text-start transition-all duration-300 hover:-translate-y-1",
                active
                  ? "border-accent bg-surface shadow-lg ring-2 ring-accent/20"
                  : "border-border bg-surface/80 hover:border-accent/40 shadow-card",
              )}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src={story.image}
                  alt={t(`items.${story.id}.names` as never)}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-[#1e1216]/75 via-[#1e1216]/15 to-transparent"
                  aria-hidden="true"
                />
                <div className="absolute right-3 bottom-3 left-3 text-white">
                  <p className="font-bold leading-snug">{t(`items.${story.id}.names` as never)}</p>
                  <p className="mt-0.5 text-xs text-white/85">{t(`items.${story.id}.location` as never)}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
