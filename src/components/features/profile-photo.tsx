import { Lock, User } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/cn";

/** Photo with an initial-letter placeholder; photos load only through the policy-checked route (docs/09). */
export async function ProfilePhoto({
  name,
  photoPublicId,
  visible = true,
  size = "thumb",
  className,
  priority = false,
}: {
  name: string;
  photoPublicId: string | null;
  /** false when the owner restricts the photo to connections */
  visible?: boolean;
  size?: "thumb" | "full";
  className?: string;
  priority?: boolean;
}) {
  const t = await getTranslations("photo");
  const box = cn("bg-accent-soft text-accent relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden", className);
  if (photoPublicId && visible) {
    return (
      <div className={box}>
        {/* eslint-disable-next-line @next/next/no-img-element -- served by an access-controlled route */}
        <img
          src={`/api/photos/${photoPublicId}?size=${size}`}
          alt={t("alt", { name })}
          width={size === "thumb" ? 320 : 800}
          height={size === "thumb" ? 400 : 1000}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="size-full object-cover"
        />
      </div>
    );
  }
  const hidden = photoPublicId && !visible;
  return (
    <div className={box} role="img" aria-label={hidden ? t("hiddenForNow") : t("placeholderAlt", { name })}>
      {hidden ? <Lock aria-hidden="true" className="size-10 opacity-70" /> : <span className="text-5xl font-bold" aria-hidden="true">{name.trim().charAt(0).toUpperCase() || <User className="size-10" />}</span>}
    </div>
  );
}
