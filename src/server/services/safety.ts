import "server-only";
import type { ReportReason } from "@/lib/profile-options";
import { exec, isDuplicateKey, one, rows, tx } from "../db";
import { opsNotify } from "../mail/send";

export async function blockUser(blockerId: number, blockedId: number): Promise<void> {
  if (blockerId === blockedId) return;
  await tx(async (conn) => {
    await exec("INSERT IGNORE INTO blocks (blocker_id, blocked_id) VALUES (?,?)", [blockerId, blockedId], conn);
    await exec(
      `UPDATE interests SET status='ended', ended_reason='blocked', responded_at=NOW(3)
        WHERE status IN ('pending','accepted') AND ((sender_id=? AND receiver_id=?) OR (sender_id=? AND receiver_id=?))`,
      [blockerId, blockedId, blockedId, blockerId],
      conn,
    );
    await exec("DELETE FROM saved_profiles WHERE (user_id=? AND saved_user_id=?) OR (user_id=? AND saved_user_id=?)", [blockerId, blockedId, blockedId, blockerId], conn);
  });
}

export async function unblockUser(blockerId: number, blockedId: number): Promise<void> {
  await exec("DELETE FROM blocks WHERE blocker_id=? AND blocked_id=?", [blockerId, blockedId]);
}

export async function listBlocked(userId: number): Promise<{ userId: number; displayName: string; publicId: string }[]> {
  const r = await rows<{ user_id: number; display_name: string; public_id: string }>(
    `SELECT p.user_id, p.display_name, p.public_id FROM blocks b JOIN profiles p ON p.user_id=b.blocked_id WHERE b.blocker_id=? ORDER BY b.created_at DESC`,
    [userId],
  );
  return r.map((x) => ({ userId: x.user_id, displayName: x.display_name, publicId: x.public_id }));
}

export async function reportUser(reporterId: number, reportedId: number, reason: ReportReason, details: string | null): Promise<"ok" | "exists"> {
  try {
    const res = await exec("INSERT INTO reports (reporter_id, reported_id, reason, details) VALUES (?,?,?,?)", [reporterId, reportedId, reason, details]);
    await opsNotify("ops-report", `#${res.insertId}: ${reason}`, [
      `Report #${res.insertId}`,
      `Reason: ${reason}`,
      `Reporter user id: ${reporterId}`,
      `Reported user id: ${reportedId}`,
      details ? `Details: ${details}` : "Details: (none)",
    ]);
    return "ok";
  } catch (e) {
    if (isDuplicateKey(e)) return "exists";
    throw e;
  }
}

export async function toggleSaved(userId: number, targetUserId: number): Promise<boolean> {
  const exists = await one("SELECT 1 AS x FROM saved_profiles WHERE user_id=? AND saved_user_id=?", [userId, targetUserId]);
  if (exists) {
    await exec("DELETE FROM saved_profiles WHERE user_id=? AND saved_user_id=?", [userId, targetUserId]);
    return false;
  }
  await exec("INSERT IGNORE INTO saved_profiles (user_id, saved_user_id) VALUES (?,?)", [userId, targetUserId]);
  return true;
}

export async function listSavedUserIds(userId: number): Promise<number[]> {
  const r = await rows<{ saved_user_id: number }>(
    `SELECT s.saved_user_id FROM saved_profiles s
       JOIN profiles p ON p.user_id=s.saved_user_id AND p.status='published'
       JOIN users u ON u.id=s.saved_user_id AND u.status='active'
      WHERE s.user_id=?
        AND NOT EXISTS (SELECT 1 FROM blocks b WHERE (b.blocker_id=? AND b.blocked_id=s.saved_user_id) OR (b.blocker_id=s.saved_user_id AND b.blocked_id=?))
      ORDER BY s.created_at DESC LIMIT 200`,
    [userId, userId, userId],
  );
  return r.map((x) => x.saved_user_id);
}

export async function countSaved(userId: number): Promise<number> {
  return (await listSavedUserIds(userId)).length;
}
