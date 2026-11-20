import { GraduationCap, MapPin, Briefcase } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { ProfilePhoto } from "@/components/features/profile-photo";
import { SaveButton } from "@/components/features/save-button";
import { Badge } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { getLocationTree, placeName } from "@/server/locations";
import type { CardData } from "@/server/services/profiles";

/** Profile summary card (docs/04 §6). The whole card is one link; save is a separate control. */
export async function ProfileCard({ card, priority = false }: { card: CardData; priority?: boolean }) {
  const t = await getTranslations("profile");
  const c = await getTranslations("common");
  const locale = (await getLocale()) as "bn" | "en";
  const tree = await getLocationTree();
  const place = placeName(tree, locale, { divisionId: card.divisionId ?? undefined, districtId: card.districtId ?? undefined, upazilaId: card.upazilaId ?? undefined });
  const photoVisible = card.photoVisibility === "members" || card.connected;
  return (
    <article className="border-border bg-surface shadow-card focus-within:ring-accent relative overflow-hidden rounded-lg border focus-within:ring-2">
      <Link href={`/profiles/${card.publicId}`} className="block focus:outline-none">
        <ProfilePhoto name={card.displayName} photoPublicId={card.photoPublicId} visible={photoVisible} priority={priority} />
        <div className="flex flex-col gap-2 p-4">
          <h3 className="text-lg font-semibold">
            {card.displayName}
            <span className="text-text-muted font-normal">{", "}{c("yearsOld", { age: card.age })}</span>
          </h3>
          {card.createdBy !== "self" ? <Badge>{t("managedBadge", { relation: t(`createdBy.${card.createdBy}` as never) })}</Badge> : null}
          <ul className="text-text-muted flex flex-col gap-1 text-sm">
            {place ? (
              <li className="flex items-center gap-2">
                <MapPin aria-hidden="true" className="size-4 shrink-0" />
                {place}
              </li>
            ) : null}
            {card.educationLevel ? (
              <li className="flex items-center gap-2">
                <GraduationCap aria-hidden="true" className="size-4 shrink-0" />
                {t(`edu.${card.educationLevel}` as never)}
              </li>
            ) : null}
            {card.occupation ? (
              <li className="flex items-center gap-2">
                <Briefcase aria-hidden="true" className="size-4 shrink-0" />
                <span className="truncate">{card.occupation}</span>
              </li>
            ) : null}
          </ul>
        </div>
      </Link>
      <div className="absolute end-2 top-2 rounded-full bg-white/90 shadow">
        <SaveButton publicId={card.publicId} name={card.displayName} saved={card.saved} />
      </div>
    </article>
  );
}
