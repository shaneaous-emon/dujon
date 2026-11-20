import "server-only";
import { appConfig } from "@/config/app";
import { exec, one, rows, tx } from "../db";
import { deleteObject } from "../storage";
import { flushOutbox } from "../mail/send";

/** Starts account deletion: profile hidden, sessions revoked, interests ended (FR-ACC-005). */
export async function requestAccountDeletion(userId: number): Promise<void> {
  await tx(async (conn) => {
    await exec("UPDATE users SET status='pending_deletion', deletion_requested_at=NOW(3) WHERE id=?", [userId], conn);
    await exec("UPDATE profiles SET status='hidden' WHERE user_id=? AND status IN ('published','draft')", [userId], conn);
    await exec("DELETE FROM sessions WHERE user_id=?", [userId], conn);
    await exec(
      "UPDATE interests SET status='ended', ended_reason='account_deleted', responded_at=NOW(3) WHERE status IN ('pending','accepted') AND (sender_id=? OR receiver_id=?)",
      [userId, userId],
      conn,
    );
  });
}

/** Anonymises accounts whose retention window has passed (docs/07 §7). Idempotent. */
export async function purgeDeletedAccounts(): Promise<number> {
  const due = await rows<{ id: number }>(
    "SELECT id FROM users WHERE status='pending_deletion' AND deletion_requested_at < (NOW(3) - INTERVAL ? DAY) LIMIT 200",
    [appConfig.accountPurgeAfterDays],
  );
  for (const { id } of due) {
    const photo = await one<{ storage_key_full: string; storage_key_thumb: string }>(
      "SELECT ph.storage_key_full, ph.storage_key_thumb FROM profile_photos ph JOIN profiles p ON p.id=ph.profile_id WHERE p.user_id=?",
      [id],
    );
    if (photo) {
      await deleteObject(photo.storage_key_full);
      await deleteObject(photo.storage_key_thumb);
    }
    await tx(async (conn) => {
      await exec("DELETE ph FROM profile_photos ph JOIN profiles p ON p.id=ph.profile_id WHERE p.user_id=?", [id], conn);
      await exec("DELETE FROM partner_preferences WHERE user_id=?", [id], conn);
      await exec("DELETE FROM saved_profiles WHERE user_id=? OR saved_user_id=?", [id, id], conn);
      await exec("DELETE FROM blocks WHERE blocker_id=? OR blocked_id=?", [id, id], conn);
      await exec("DELETE FROM interests WHERE sender_id=? OR receiver_id=?", [id, id], conn);
      await exec("DELETE FROM auth_tokens WHERE user_id=?", [id], conn);
      await exec("DELETE FROM sessions WHERE user_id=?", [id], conn);
      // keep a minimal tombstone so reports/moderation history stays consistent; profile row is anonymised, not left readable
      await exec(
        `UPDATE profiles SET display_name='-', date_of_birth='1900-01-01', marital_status=NULL, height_cm=NULL, education_level=NULL,
                education_detail=NULL, occupation=NULL, division_id=NULL, district_id=NULL, upazila_id=NULL, about=NULL, family_info=NULL,
                status='hidden' WHERE user_id=?`,
        [id],
        conn,
      );
      await exec("UPDATE reports SET details=NULL WHERE (reporter_id=? OR reported_id=?) AND status IN ('resolved','dismissed')", [id, id], conn);
      await exec(
        `UPDATE users SET email=CONCAT('deleted+', id, '@invalid.dujon'), password_hash=NULL, full_name=NULL, mobile_e164=NULL,
                status='deleted', deleted_at=NOW(3), email_verified_at=NULL WHERE id=?`,
        [id],
        conn,
      );
    });
  }
  return due.length;
}

export async function runDailyMaintenance(): Promise<Record<string, number>> {
  const purged = await purgeDeletedAccounts();
  const s = await exec("DELETE FROM sessions WHERE expires_at < NOW(3)");
  const t = await exec("DELETE FROM auth_tokens WHERE (expires_at < NOW(3) - INTERVAL 7 DAY) OR (used_at IS NOT NULL AND used_at < NOW(3) - INTERVAL 7 DAY)");
  const r = await exec("DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL 1 DAY");
  const c = await exec("DELETE FROM contact_messages WHERE created_at < NOW(3) - INTERVAL 12 MONTH");
  const m = await exec("DELETE FROM mail_outbox WHERE status='sent' AND sent_at < NOW(3) - INTERVAL 7 DAY");
  const mail = await flushOutbox();
  return { purgedAccounts: purged, sessions: s.affectedRows, tokens: t.affectedRows, rateLimits: r.affectedRows, contactMessages: c.affectedRows, outbox: m.affectedRows, mailSent: mail.sent, mailFailed: mail.failed };
}
