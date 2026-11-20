import "server-only";
import { appConfig } from "@/config/app";
import type { Gender } from "@/lib/profile-options";
import { one } from "../db";
import type { OwnProfile } from "./profiles";

export interface Viewer {
  userId: number;
  gender: Gender;
  profileStatus: OwnProfile["status"];
  emailVerified: boolean;
}

export async function getViewer(userId: number, emailVerified: boolean): Promise<Viewer | null> {
  const p = await one<{ gender: Gender; status: OwnProfile["status"] }>("SELECT gender,status FROM profiles WHERE user_id=?", [userId]);
  return p ? { userId, gender: p.gender, profileStatus: p.status, emailVerified } : null;
}

export async function isBlockedEitherWay(a: number, b: number): Promise<boolean> {
  const r = await one(
    "SELECT 1 AS x FROM blocks WHERE (blocker_id=? AND blocked_id=?) OR (blocker_id=? AND blocked_id=?) LIMIT 1",
    [a, b, b, a],
  );
  return r !== null;
}

export async function areConnected(a: number, b: number): Promise<boolean> {
  const r = await one(
    "SELECT 1 AS x FROM interests WHERE status='accepted' AND ((sender_id=? AND receiver_id=?) OR (sender_id=? AND receiver_id=?)) LIMIT 1",
    [a, b, b, a],
  );
  return r !== null;
}

export async function hasInterestRelation(a: number, b: number): Promise<boolean> {
  const r = await one(
    "SELECT 1 AS x FROM interests WHERE status IN ('pending','accepted') AND ((sender_id=? AND receiver_id=?) OR (sender_id=? AND receiver_id=?)) LIMIT 1",
    [a, b, b, a],
  );
  return r !== null;
}

export type ViewDecision = "self" | "ok" | "ok-hidden" | "denied";

/**
 * Who may see a profile (FR-DISC-011, FR-SAFE-*): the opposite gender, both published, neither blocked.
 * Hidden profiles stay visible only to people already in an interest/connection with the owner.
 */
export async function canViewProfile(viewer: Viewer, target: OwnProfile, targetUserActive: boolean): Promise<ViewDecision> {
  if (viewer.userId === target.userId) return "self";
  if (!targetUserActive) return "denied";
  if (viewer.gender === target.gender) return "denied";
  if (appConfig.requirePublishedProfileToSearch && viewer.profileStatus !== "published") return "denied";
  if (await isBlockedEitherWay(viewer.userId, target.userId)) return "denied";
  if (target.status === "published") return "ok";
  if (target.status === "hidden" && (await hasInterestRelation(viewer.userId, target.userId))) return "ok-hidden";
  return "denied";
}

/** Photo visibility (FR-PHOTO-005): "connections" photos are shown only to the owner and connected members. */
export async function canSeePhoto(viewerUserId: number, ownerUserId: number, visibility: "members" | "connections"): Promise<boolean> {
  if (viewerUserId === ownerUserId) return true;
  if (visibility === "members") return true;
  return areConnected(viewerUserId, ownerUserId);
}
