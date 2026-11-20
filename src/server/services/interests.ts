import "server-only";
import { appConfig } from "@/config/app";
import { todayInDhaka, ymdToString } from "@/lib/dates";
import { exec, one, rows, tx } from "../db";
import { sendMail } from "../mail/send";
import { absoluteUrl } from "../mail/templates";
import { canViewProfile, getViewer } from "./policies";
import { getProfileByPublicId } from "./profiles";

export type InterestStatus = "pending" | "accepted" | "declined" | "withdrawn" | "ended";

/** Relationship of the viewer to another member, driving the button state on SCR-19 (docs/04). */
export type InterestState =
  | { kind: "none" }
  | { kind: "sent"; interestId: number }
  | { kind: "received"; interestId: number }
  | { kind: "connected"; interestId: number }
  | { kind: "declined"; retryAfter: string };

interface InterestRow {
  id: number;
  sender_id: number;
  receiver_id: number;
  status: InterestStatus;
  created_at: Date;
  responded_at: Date | null;
}

export async function getInterestState(viewerId: number, otherId: number): Promise<InterestState> {
  const list = await rows<InterestRow>(
    "SELECT id,sender_id,receiver_id,status,created_at,responded_at FROM interests WHERE (sender_id=? AND receiver_id=?) OR (sender_id=? AND receiver_id=?)",
    [viewerId, otherId, otherId, viewerId],
  );
  const accepted = list.find((i) => i.status === "accepted");
  if (accepted) return { kind: "connected", interestId: accepted.id };
  const incoming = list.find((i) => i.receiver_id === viewerId && i.status === "pending");
  if (incoming) return { kind: "received", interestId: incoming.id };
  const outgoing = list.find((i) => i.sender_id === viewerId);
  if (outgoing?.status === "pending") return { kind: "sent", interestId: outgoing.id };
  if (outgoing?.status === "declined" && outgoing.responded_at) {
    const until = new Date(new Date(outgoing.responded_at).getTime() + appConfig.interestDeclineCooldownDays * 86400_000);
    if (until.getTime() > Date.now()) return { kind: "declined", retryAfter: until.toISOString() };
  }
  return { kind: "none" };
}

export type SendResult =
  | { ok: true; autoAccepted: boolean }
  | { ok: false; error: "notAvailable" | "verifyFirst" | "interestExists" | "dailyLimit" | "publishFirst" | "cooldown"; retryAfter?: string };

function startOfTodayDhaka(): Date {
  const { y, m, d } = todayInDhaka();
  return new Date(`${ymdToString({ y, m, d })}T00:00:00+06:00`);
}

export async function sendInterest(viewerUserId: number, emailVerified: boolean, targetPublicId: string): Promise<SendResult> {
  if (appConfig.requireVerifiedEmailForInterests && !emailVerified) return { ok: false, error: "verifyFirst" };
  const viewer = await getViewer(viewerUserId, emailVerified);
  if (!viewer) return { ok: false, error: "notAvailable" };
  if (viewer.profileStatus !== "published") return { ok: false, error: "publishFirst" };
  const target = await getProfileByPublicId(targetPublicId);
  if (!target) return { ok: false, error: "notAvailable" };
  const active = await one<{ status: string; email: string; preferred_locale: "bn" | "en"; notify_interest_received: number }>(
    "SELECT status,email,preferred_locale,notify_interest_received FROM users WHERE id=?",
    [target.userId],
  );
  const decision = await canViewProfile(viewer, target, active?.status === "active");
  if (decision !== "ok") return { ok: false, error: "notAvailable" };

  const state = await getInterestState(viewerUserId, target.userId);
  if (state.kind === "connected" || state.kind === "sent") return { ok: false, error: "interestExists" };
  if (state.kind === "declined") return { ok: false, error: "cooldown", retryAfter: state.retryAfter };
  if (state.kind === "received") {
    await acceptInterest(viewerUserId, emailVerified, state.interestId);
    return { ok: true, autoAccepted: true };
  }

  const sentToday = await one<{ c: number }>("SELECT COUNT(*) AS c FROM interests WHERE sender_id=? AND created_at >= ?", [
    viewerUserId,
    startOfTodayDhaka(),
  ]);
  if ((sentToday?.c ?? 0) >= appConfig.interestDailyLimit) return { ok: false, error: "dailyLimit" };

  // new row, or re-send over an earlier withdrawn / declined(after cooldown) / ended row
  await exec(
    `INSERT INTO interests (sender_id, receiver_id, status) VALUES (?,?, 'pending')
     ON DUPLICATE KEY UPDATE status='pending', ended_reason=NULL, responded_at=NULL, created_at=NOW(3)`,
    [viewerUserId, target.userId],
  );
  if (active && active.notify_interest_received === 1) {
    await sendMail(active.email, "interest-received", active.preferred_locale, {
      url: absoluteUrl("/dashboard/interests?tab=received", active.preferred_locale),
    });
  }
  return { ok: true, autoAccepted: false };
}

export async function acceptInterest(userId: number, emailVerified: boolean, interestId: number): Promise<{ ok: boolean; error?: "verifyFirst" | "notAvailable" }> {
  if (appConfig.requireVerifiedEmailForInterests && !emailVerified) return { ok: false, error: "verifyFirst" };
  const res = await exec(
    "UPDATE interests SET status='accepted', responded_at=NOW(3) WHERE id=? AND receiver_id=? AND status='pending'",
    [interestId, userId],
  );
  if (res.affectedRows !== 1) return { ok: false, error: "notAvailable" };
  const s = await one<{ email: string; preferred_locale: "bn" | "en"; notify_interest_accepted: number }>(
    `SELECT u.email, u.preferred_locale, u.notify_interest_accepted FROM interests i JOIN users u ON u.id=i.sender_id WHERE i.id=?`,
    [interestId],
  );
  if (s && s.notify_interest_accepted === 1) {
    await sendMail(s.email, "interest-accepted", s.preferred_locale, { url: absoluteUrl("/dashboard/interests?tab=connections", s.preferred_locale) });
  }
  return { ok: true };
}

export async function declineInterest(userId: number, interestId: number): Promise<boolean> {
  const res = await exec(
    "UPDATE interests SET status='declined', responded_at=NOW(3) WHERE id=? AND receiver_id=? AND status='pending'",
    [interestId, userId],
  );
  return res.affectedRows === 1;
}

export async function withdrawInterest(userId: number, interestId: number): Promise<boolean> {
  const res = await exec("UPDATE interests SET status='withdrawn', responded_at=NOW(3) WHERE id=? AND sender_id=? AND status='pending'", [
    interestId,
    userId,
  ]);
  return res.affectedRows === 1;
}

export interface InterestListItem {
  interestId: number;
  otherUserId: number;
  status: InterestStatus;
  at: Date;
}

export async function listInterests(userId: number, tab: "received" | "sent" | "connections"): Promise<InterestListItem[]> {
  type R = { id: number; other: number; status: InterestStatus; at: Date };
  if (tab === "received") {
    const r = await rows<R>(
      "SELECT id, sender_id AS other, status, created_at AS at FROM interests WHERE receiver_id=? AND status='pending' ORDER BY created_at DESC LIMIT 100",
      [userId],
    );
    return r.map((x) => ({ interestId: x.id, otherUserId: x.other, status: x.status, at: x.at }));
  }
  if (tab === "sent") {
    const r = await rows<R>(
      "SELECT id, receiver_id AS other, status, IFNULL(responded_at, created_at) AS at FROM interests WHERE sender_id=? AND status IN ('pending','declined') ORDER BY created_at DESC LIMIT 100",
      [userId],
    );
    return r.map((x) => ({ interestId: x.id, otherUserId: x.other, status: x.status, at: x.at }));
  }
  const r = await rows<R>(
    `SELECT id, IF(sender_id=?, receiver_id, sender_id) AS other, status, responded_at AS at FROM interests
      WHERE status='accepted' AND (sender_id=? OR receiver_id=?) ORDER BY responded_at DESC LIMIT 100`,
    [userId, userId, userId],
  );
  return r.map((x) => ({ interestId: x.id, otherUserId: x.other, status: x.status, at: x.at }));
}

export async function countPendingReceived(userId: number): Promise<number> {
  const r = await one<{ c: number }>("SELECT COUNT(*) AS c FROM interests WHERE receiver_id=? AND status='pending'", [userId]);
  return r?.c ?? 0;
}

/** Contact details are revealed only for accepted interests (FR-INT-006). Returns null otherwise. */
export async function getContactIfConnected(viewerId: number, otherId: number): Promise<{ email: string; mobile: string | null } | null> {
  const ok = await one(
    "SELECT 1 AS x FROM interests WHERE status='accepted' AND ((sender_id=? AND receiver_id=?) OR (sender_id=? AND receiver_id=?)) LIMIT 1",
    [viewerId, otherId, otherId, viewerId],
  );
  if (!ok) return null;
  const u = await one<{ email: string; mobile_e164: string | null; status: string }>("SELECT email, mobile_e164, status FROM users WHERE id=?", [otherId]);
  if (!u || u.status !== "active") return null;
  return { email: u.email, mobile: u.mobile_e164 };
}

export { tx };
