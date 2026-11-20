import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { appConfig, isProduction } from "@/config/app";
import { exec, one } from "../db";
import { randomToken, sha256Hex } from "../crypto";

export const SESSION_COOKIE = "dujon_session";
/** Non-secret presence flag so cached public pages can show "Dashboard" instead of "Log in". */
export const PRESENCE_COOKIE = "dujon_in";

export interface SessionUser {
  id: number;
  email: string;
  emailVerified: boolean;
  fullName: string | null;
  mobile: string | null;
  role: "user" | "admin";
  status: "active" | "suspended" | "pending_deletion" | "deleted";
  locale: "bn" | "en";
  notifyReceived: boolean;
  notifyAccepted: boolean;
  sessionId: string;
}

interface Row {
  id: number;
  email: string;
  email_verified_at: Date | null;
  full_name: string | null;
  mobile_e164: string | null;
  role: "user" | "admin";
  status: SessionUser["status"];
  preferred_locale: "bn" | "en";
  notify_interest_received: number;
  notify_interest_accepted: number;
  session_id: string;
  last_used_at: Date;
}

const cookieBase = () => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: isProduction,
  path: "/",
});

export async function createSession(userId: number): Promise<void> {
  const token = randomToken();
  const id = sha256Hex(token);
  const ttlMs = appConfig.sessionTtlDays * 24 * 60 * 60 * 1000;
  const expires = new Date(Date.now() + ttlMs);
  const ua = ((await headers()).get("user-agent") ?? "").slice(0, 255) || null;
  await exec("INSERT INTO sessions (id, user_id, expires_at, user_agent) VALUES (?,?,?,?)", [id, userId, expires, ua]);
  await exec("UPDATE users SET last_login_at = NOW(3) WHERE id = ?", [userId]);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, { ...cookieBase(), expires });
  jar.set(PRESENCE_COOKIE, "1", { sameSite: "lax", secure: isProduction, path: "/", expires });
}

export async function destroyCurrentSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await exec("DELETE FROM sessions WHERE id = ?", [sha256Hex(token)]);
  jar.delete(SESSION_COOKIE);
  jar.delete(PRESENCE_COOKIE);
}

export async function destroyAllSessions(userId: number, exceptSessionId?: string): Promise<void> {
  if (exceptSessionId) await exec("DELETE FROM sessions WHERE user_id = ? AND id <> ?", [userId, exceptSessionId]);
  else await exec("DELETE FROM sessions WHERE user_id = ?", [userId]);
}

/** Resolve the logged-in user for this request (null for guests, suspended or deleted accounts). */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const id = sha256Hex(token);
  const r = await one<Row>(
    `SELECT u.id, u.email, u.email_verified_at, u.full_name, u.mobile_e164, u.role, u.status, u.preferred_locale,
            u.notify_interest_received, u.notify_interest_accepted, s.id AS session_id, s.last_used_at
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.id = ? AND s.expires_at > NOW(3)`,
    [id],
  );
  if (!r || r.status !== "active") return null;
  // touch at most once per hour (docs/07 §3.2)
  if (Date.now() - new Date(r.last_used_at).getTime() > 60 * 60 * 1000) {
    await exec("UPDATE sessions SET last_used_at = NOW(3) WHERE id = ?", [id]);
  }
  return {
    id: r.id,
    email: r.email,
    emailVerified: r.email_verified_at !== null,
    fullName: r.full_name,
    mobile: r.mobile_e164,
    role: r.role,
    status: r.status,
    locale: r.preferred_locale,
    notifyReceived: r.notify_interest_received === 1,
    notifyAccepted: r.notify_interest_accepted === 1,
    sessionId: r.session_id,
  };
});
