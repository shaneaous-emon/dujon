import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/server/auth/session";
import { one } from "@/server/db";
import { getObject } from "@/server/storage";
import { canSeePhoto, canViewProfile, getViewer } from "@/server/services/policies";
import { getProfileByPublicId } from "@/server/services/profiles";

/** Private photo delivery: only members allowed to see the profile (and photo visibility) get the bytes (FR-PHOTO-003/005). */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const notFound = () => new NextResponse(null, { status: 404, headers: { "Cache-Control": "no-store" } });
  const user = await getCurrentUser();
  if (!user) return notFound();
  const { id } = await ctx.params;
  if (!/^[a-z0-9]{16}$/.test(id)) return notFound();

  const photo = await one<{ storage_key_full: string; storage_key_thumb: string; moderation_status: string; profile_public_id: string }>(
    `SELECT ph.storage_key_full, ph.storage_key_thumb, ph.moderation_status, p.public_id AS profile_public_id
       FROM profile_photos ph JOIN profiles p ON p.id = ph.profile_id WHERE ph.public_id = ?`,
    [id],
  );
  if (!photo || photo.moderation_status === "rejected") return notFound();
  const profile = await getProfileByPublicId(photo.profile_public_id);
  if (!profile) return notFound();

  if (profile.userId !== user.id) {
    const viewer = await getViewer(user.id, user.emailVerified);
    if (!viewer) return notFound();
    const owner = await one<{ status: string }>("SELECT status FROM users WHERE id=?", [profile.userId]);
    const decision = await canViewProfile(viewer, profile, owner?.status === "active");
    if (decision !== "ok" && decision !== "ok-hidden") return notFound();
    if (!(await canSeePhoto(user.id, profile.userId, profile.photoVisibility))) return notFound();
  }

  const size = req.nextUrl.searchParams.get("size") === "full" ? "full" : "thumb";
  const bytes = await getObject(size === "full" ? photo.storage_key_full : photo.storage_key_thumb);
  if (!bytes) return notFound();
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "private, max-age=300",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex",
    },
  });
}
