"use server";

import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { appConfig } from "@/config/app";
import { ageOn, isValidYmd, todayInDhaka, ymdToString } from "@/lib/dates";
import { checkPassword, isValidEmail, normalizeBdMobile, normalizeEmail } from "@/lib/validation";
import { echo, safeNext, str, type FormState } from "./types";
import { exec, isDuplicateKey, one, tx } from "@/server/db";
import { randomPublicId, randomToken, sha256Hex } from "@/server/crypto";
import { burnPasswordTime, hashPassword, verifyPassword } from "@/server/auth/password";
import { createSession, destroyAllSessions, destroyCurrentSession, getCurrentUser } from "@/server/auth/session";
import { hit, hitIp, RULES } from "@/server/rate-limit";
import { sendMail } from "@/server/mail/send";
import { absoluteUrl } from "@/server/mail/templates";

type Loc = "bn" | "en";
const asLoc = (l: string): Loc => (l === "en" ? "en" : "bn");

async function issueToken(userId: number, type: "email_verify" | "password_reset", ttlMs: number): Promise<string> {
  const token = randomToken();
  await exec("DELETE FROM auth_tokens WHERE user_id=? AND type=? AND used_at IS NULL", [userId, type]);
  await exec("INSERT INTO auth_tokens (user_id,type,token_hash,expires_at) VALUES (?,?,?,?)", [
    userId,
    type,
    sha256Hex(token),
    new Date(Date.now() + ttlMs),
  ]);
  return token;
}

export async function sendVerificationEmail(userId: number, email: string, locale: Loc): Promise<void> {
  const token = await issueToken(userId, "email_verify", appConfig.emailVerifyTtlHours * 3600_000);
  await sendMail(email, "verify-email", locale, { url: absoluteUrl(`/verify-email?token=${token}`, locale) });
}

/* ------------------------------------------------------------------ register */

export async function registerAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const locale = asLoc(await getLocale());
  const fields = echo(fd, ["fullName", "email", "mobile", "gender", "dobDay", "dobMonth", "dobYear"]);
  const errors: Record<string, string> = {};

  const fullName = str(fd, "fullName").replace(/\s+/g, " ").trim();
  const email = normalizeEmail(str(fd, "email"));
  const mobileRaw = str(fd, "mobile").trim();
  const password = str(fd, "password");
  const gender = str(fd, "gender");
  const agree = str(fd, "agree") === "on";

  if (fullName.length < 2 || fullName.length > 80) errors.fullName = "required";
  if (!isValidEmail(email)) errors.email = "email";
  let mobile: string | null = null;
  if (mobileRaw) {
    mobile = normalizeBdMobile(mobileRaw);
    if (!mobile) errors.mobile = "mobile";
  }
  const pw = checkPassword(password, email);
  if (pw === "short" || pw === "long") errors.password = "passwordShort";
  else if (pw === "common") errors.password = "passwordCommon";
  if (gender !== "male" && gender !== "female") errors.gender = "required";

  const dob = { y: Number(fields.dobYear), m: Number(fields.dobMonth), d: Number(fields.dobDay) };
  let dobString = "";
  if (!fields.dobYear || !fields.dobMonth || !fields.dobDay || !isValidYmd(dob)) errors.dob = "invalidDate";
  else {
    dobString = ymdToString(dob);
    const age = ageOn(dob, todayInDhaka());
    if (age < appConfig.minRegistrationAge) errors.dob = "underAge";
    else if (age > appConfig.maxRegistrationAge) errors.dob = "invalidDate";
  }
  if (!agree) errors.agree = "required";
  if (Object.keys(errors).length) return { errors, fields };

  const rl = await hitIp(RULES.register);
  if (!rl.allowed) return { formError: "rateLimited", values: { minutes: rl.retryAfterMinutes }, fields };

  const existing = await one<{ id: number; preferred_locale: Loc }>("SELECT id, preferred_locale FROM users WHERE email=?", [email]);
  if (existing) {
    // FR-AUTH-003: no duplicate account, owner is informed, response looks like a normal success.
    await burnPasswordTime(password);
    await sendMail(email, "registration-attempt", existing.preferred_locale, { url: absoluteUrl("/login", existing.preferred_locale) });
    return { ok: true, notice: "checkEmail" };
  }

  const passwordHash = await hashPassword(password);
  const displayName = fullName.split(" ")[0]!.slice(0, 40);
  let userId = 0;
  try {
    userId = await tx(async (conn) => {
      const u = await exec(
        `INSERT INTO users (email,password_hash,full_name,mobile_e164,preferred_locale,terms_version,privacy_version,terms_accepted_at)
         VALUES (?,?,?,?,?,?,?,NOW(3))`,
        [email, passwordHash, fullName, mobile, locale, appConfig.termsVersion, appConfig.privacyVersion],
        conn,
      );
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          await exec(
            "INSERT INTO profiles (user_id,public_id,display_name,gender,date_of_birth) VALUES (?,?,?,?,?)",
            [u.insertId, randomPublicId(12), displayName, gender, dobString],
            conn,
          );
          return u.insertId;
        } catch (e) {
          if (!isDuplicateKey(e) || attempt === 4) throw e;
        }
      }
      return u.insertId;
    });
  } catch (e) {
    if (isDuplicateKey(e)) return { ok: true, notice: "checkEmail" }; // lost a race with another registration
    throw e;
  }

  await sendVerificationEmail(userId, email, locale);
  await createSession(userId);
  redirect({ href: "/onboarding/about", locale });
  return { ok: true };
}

/* --------------------------------------------------------------------- login */

export async function loginAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const locale = asLoc(await getLocale());
  const email = normalizeEmail(str(fd, "email"));
  const password = str(fd, "password");
  const next = safeNext(str(fd, "next"));
  const fields = { email };
  if (!email || !password) return { errors: { email: email ? "" : "required", password: password ? "" : "required" }, fields };

  const ipRate = await hitIp(RULES.login);
  const emailRate = await hit(RULES.loginEmail, sha256Hex(email));
  if (!ipRate.allowed || !emailRate.allowed) {
    return { formError: "rateLimited", values: { minutes: Math.max(ipRate.retryAfterMinutes, emailRate.retryAfterMinutes) }, fields };
  }

  const user = await one<{ id: number; password_hash: string | null; status: string }>(
    "SELECT id,password_hash,status FROM users WHERE email=?",
    [email],
  );
  if (!user) {
    await burnPasswordTime(password);
    return { formError: "invalidCredentials", fields };
  }
  const ok = await verifyPassword(user.password_hash, password);
  if (!ok || user.status !== "active") return { formError: "invalidCredentials", fields };

  await createSession(user.id);
  redirect({ href: next ?? "/dashboard", locale });
  return { ok: true };
}

export async function logoutAction(): Promise<void> {
  const locale = await getLocale();
  await destroyCurrentSession();
  redirect({ href: "/", locale });
}

/* ------------------------------------------------------------- forgot / reset */

export async function forgotPasswordAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const email = normalizeEmail(str(fd, "email"));
  const fields = { email };
  if (!isValidEmail(email)) return { errors: { email: "email" }, fields };
  const rl = await hitIp(RULES.forgot);
  if (!rl.allowed) return { formError: "rateLimited", values: { minutes: rl.retryAfterMinutes }, fields };

  const user = await one<{ id: number; preferred_locale: Loc; status: string }>(
    "SELECT id, preferred_locale, status FROM users WHERE email=?",
    [email],
  );
  if (user && user.status === "active") {
    const token = await issueToken(user.id, "password_reset", appConfig.passwordResetTtlMinutes * 60_000);
    await sendMail(email, "reset-password", user.preferred_locale, {
      url: absoluteUrl(`/reset-password?token=${token}`, user.preferred_locale),
    });
  }
  return { ok: true, notice: "forgotSent" }; // identical response either way (FR-AUTH-009)
}

export async function resetPasswordAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const locale = asLoc(await getLocale());
  const token = str(fd, "token");
  const password = str(fd, "password");
  const confirm = str(fd, "confirm");
  const errors: Record<string, string> = {};
  const pw = checkPassword(password);
  if (pw === "short" || pw === "long") errors.password = "passwordShort";
  else if (pw === "common") errors.password = "passwordCommon";
  if (password !== confirm) errors.confirm = "passwordMismatch";
  if (Object.keys(errors).length) return { errors };

  const row = await one<{ id: number; user_id: number }>(
    "SELECT id,user_id FROM auth_tokens WHERE token_hash=? AND type='password_reset' AND used_at IS NULL AND expires_at > NOW(3)",
    [sha256Hex(token)],
  );
  if (!row) return { formError: "linkExpired" };

  const hashed = await hashPassword(password);
  const claimed = await exec("UPDATE auth_tokens SET used_at=NOW(3) WHERE id=? AND used_at IS NULL", [row.id]);
  if (claimed.affectedRows !== 1) return { formError: "linkExpired" };
  await exec("UPDATE users SET password_hash=? WHERE id=?", [hashed, row.user_id]);
  await destroyAllSessions(row.user_id);
  const u = await one<{ email: string; preferred_locale: Loc }>("SELECT email, preferred_locale FROM users WHERE id=?", [row.user_id]);
  if (u) await sendMail(u.email, "password-changed", u.preferred_locale, { url: absoluteUrl("/login", u.preferred_locale) });
  redirect({ href: { pathname: "/login", query: { reset: "1" } }, locale });
  return { ok: true };
}

/* -------------------------------------------------------------------- verify */

export async function resendVerificationAction(): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { formError: "generic" };
  if (user.emailVerified) return { ok: true, notice: "alreadyVerified" };
  const rl = await hit(RULES.resend, `user:${user.id}`);
  if (!rl.allowed) return { formError: "rateLimited", values: { minutes: rl.retryAfterMinutes } };
  await sendVerificationEmail(user.id, user.email, user.locale);
  return { ok: true, notice: "verificationSent" };
}

/** Consumes a verification token. Used by the /verify-email page. */
export async function consumeVerificationToken(token: string): Promise<"ok" | "invalid"> {
  if (!token) return "invalid";
  const row = await one<{ id: number; user_id: number }>(
    "SELECT id,user_id FROM auth_tokens WHERE token_hash=? AND type='email_verify' AND used_at IS NULL AND expires_at > NOW(3)",
    [sha256Hex(token)],
  );
  if (!row) return "invalid";
  const claimed = await exec("UPDATE auth_tokens SET used_at=NOW(3) WHERE id=? AND used_at IS NULL", [row.id]);
  if (claimed.affectedRows !== 1) return "invalid";
  await exec("UPDATE users SET email_verified_at=COALESCE(email_verified_at, NOW(3)) WHERE id=?", [row.user_id]);
  return "ok";
}
