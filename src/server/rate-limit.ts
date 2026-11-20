import "server-only";
import { headers } from "next/headers";
import { exec, one } from "./db";
import { sha256Hex } from "./crypto";

export interface RateRule {
  /** logical action, e.g. "login" */
  action: string;
  limit: number;
  windowSeconds: number;
}

export const RULES = {
  login: { action: "login", limit: 10, windowSeconds: 15 * 60 },
  loginEmail: { action: "login-email", limit: 5, windowSeconds: 15 * 60 },
  register: { action: "register", limit: 5, windowSeconds: 60 * 60 },
  forgot: { action: "forgot", limit: 5, windowSeconds: 60 * 60 },
  resend: { action: "resend", limit: 3, windowSeconds: 60 * 60 },
  contact: { action: "contact", limit: 5, windowSeconds: 60 * 60 },
  report: { action: "report", limit: 10, windowSeconds: 24 * 60 * 60 },
  photo: { action: "photo", limit: 20, windowSeconds: 60 * 60 },
  password: { action: "password", limit: 5, windowSeconds: 60 * 60 },
} satisfies Record<string, RateRule>;

/** Hash of the caller's IP (no raw IPs are stored, docs/07 §3.14). */
export async function clientKey(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = fwd || h.get("x-real-ip") || "unknown";
  return sha256Hex(`${process.env.RATE_LIMIT_SALT ?? "dev"}|ip|${ip}`);
}

export interface RateResult {
  allowed: boolean;
  retryAfterMinutes: number;
}

/**
 * Fixed-window counter in MySQL. `identifier` is already hashed or non-personal (ip hash / user id).
 * Returns allowed=false once the count in the current window exceeds the limit.
 */
export async function hit(rule: RateRule, identifier: string): Promise<RateResult> {
  const nowSec = Math.floor(Date.now() / 1000);
  const windowStartSec = nowSec - (nowSec % rule.windowSeconds);
  const windowStart = new Date(windowStartSec * 1000);
  const key = sha256Hex(`${rule.action}:${identifier}`);
  await exec(
    "INSERT INTO rate_limits (key_hash, window_start, count) VALUES (?,?,1) ON DUPLICATE KEY UPDATE count = count + 1",
    [key, windowStart],
  );
  const row = await one<{ count: number }>("SELECT count FROM rate_limits WHERE key_hash=? AND window_start=?", [key, windowStart]);
  const count = row?.count ?? 1;
  const retryAfterMinutes = Math.max(1, Math.ceil((windowStartSec + rule.windowSeconds - nowSec) / 60));
  return { allowed: count <= rule.limit, retryAfterMinutes };
}

export async function hitIp(rule: RateRule): Promise<RateResult> {
  return hit(rule, await clientKey());
}
