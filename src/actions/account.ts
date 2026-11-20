"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { checkPassword, normalizeBdMobile, isValidEmail, normalizeEmail } from "@/lib/validation";
import { actionUser } from "./guard";
import { echo, str, type FormState } from "./types";
import { exec, one } from "@/server/db";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { destroyAllSessions, destroyCurrentSession, PRESENCE_COOKIE } from "@/server/auth/session";
import { hit, hitIp, RULES } from "@/server/rate-limit";
import { sendMail, opsNotify } from "@/server/mail/send";
import { absoluteUrl } from "@/server/mail/templates";
import { requestAccountDeletion } from "@/server/services/account";
import { CONTACT_SUBJECTS } from "@/lib/profile-options";
import { cleanText } from "@/lib/validation";
import { getCurrentUser } from "@/server/auth/session";

export async function saveSettingsAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await actionUser();
  const mobileRaw = str(fd, "mobile").trim();
  let mobile: string | null = null;
  if (mobileRaw) {
    mobile = normalizeBdMobile(mobileRaw);
    if (!mobile) return { errors: { mobile: "mobile" }, fields: { mobile: mobileRaw } };
  }
  await exec("UPDATE users SET mobile_e164=?, notify_interest_received=?, notify_interest_accepted=? WHERE id=?", [
    mobile,
    str(fd, "notifyReceived") === "on" ? 1 : 0,
    str(fd, "notifyAccepted") === "on" ? 1 : 0,
    user.id,
  ]);
  revalidatePath("/", "layout");
  return { ok: true, notice: "saved" };
}

export async function setLocaleAction(locale: string): Promise<void> {
  const user = await getCurrentUser();
  if (user && (locale === "bn" || locale === "en")) await exec("UPDATE users SET preferred_locale=? WHERE id=?", [locale, user.id]);
}

export async function changePasswordAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await actionUser();
  const current = str(fd, "currentPassword");
  const next = str(fd, "newPassword");
  const confirm = str(fd, "confirm");
  const errors: Record<string, string> = {};
  const pw = checkPassword(next, user.email);
  if (pw === "short" || pw === "long") errors.newPassword = "passwordShort";
  else if (pw === "common") errors.newPassword = "passwordCommon";
  if (next !== confirm) errors.confirm = "passwordMismatch";
  if (!current) errors.currentPassword = "required";
  if (Object.keys(errors).length) return { errors };
  const rl = await hit(RULES.password, `user:${user.id}`);
  if (!rl.allowed) return { formError: "rateLimited", values: { minutes: rl.retryAfterMinutes } };
  const row = await one<{ password_hash: string | null }>("SELECT password_hash FROM users WHERE id=?", [user.id]);
  if (!(await verifyPassword(row?.password_hash ?? null, current))) return { errors: { currentPassword: "wrongPassword" } };
  await exec("UPDATE users SET password_hash=? WHERE id=?", [await hashPassword(next), user.id]);
  await destroyAllSessions(user.id, user.sessionId);
  await sendMail(user.email, "password-changed", user.locale, { url: absoluteUrl("/login", user.locale) });
  return { ok: true, notice: "passwordChanged" };
}

export async function logoutAllAction(): Promise<void> {
  const user = await actionUser();
  const locale = await getLocale();
  await destroyAllSessions(user.id);
  (await cookies()).delete(PRESENCE_COOKIE);
  redirect({ href: "/login", locale });
}

export async function deleteAccountAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await actionUser();
  const locale = await getLocale();
  const confirmWord = str(fd, "confirmWord").trim();
  const password = str(fd, "password");
  const expected = locale === "bn" ? "মুছে ফেলুন" : "DELETE";
  if (confirmWord !== expected && confirmWord.toUpperCase() !== "DELETE") return { errors: { confirmWord: "confirmWord" } };
  const row = await one<{ password_hash: string | null }>("SELECT password_hash FROM users WHERE id=?", [user.id]);
  if (!(await verifyPassword(row?.password_hash ?? null, password))) return { errors: { password: "wrongPassword" } };
  await requestAccountDeletion(user.id);
  await sendMail(user.email, "account-deletion", user.locale);
  await destroyCurrentSession();
  redirect({ href: "/account-deleted", locale });
  return { ok: true };
}

export async function contactAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const locale = (await getLocale()) === "en" ? "en" : "bn";
  const fields = echo(fd, ["name", "email", "mobile", "subject", "message"]);
  const errors: Record<string, string> = {};
  const name = cleanText(fields.name!, 80);
  const email = normalizeEmail(fields.email!);
  const message = cleanText(fields.message!, 2000);
  if (name.length < 2) errors.name = "required";
  if (!isValidEmail(email)) errors.email = "email";
  let mobile: string | null = null;
  if (fields.mobile!.trim()) {
    mobile = normalizeBdMobile(fields.mobile!);
    if (!mobile) errors.mobile = "mobile";
  }
  if (!(CONTACT_SUBJECTS as readonly string[]).includes(fields.subject!)) errors.subject = "required";
  if (message.length < 10) errors.message = "required";
  if (str(fd, "website")) return { ok: true, notice: "contactSent" }; // honeypot: pretend success
  if (Object.keys(errors).length) return { errors, fields };
  const rl = await hitIp(RULES.contact);
  if (!rl.allowed) return { formError: "rateLimited", values: { minutes: rl.retryAfterMinutes }, fields };
  const user = await getCurrentUser();
  await exec("INSERT INTO contact_messages (user_id,name,email,mobile_e164,subject,message,locale) VALUES (?,?,?,?,?,?,?)", [
    user?.id ?? null,
    name,
    email,
    mobile,
    fields.subject,
    message,
    locale,
  ]);
  await opsNotify("ops-contact", fields.subject!, [`From: ${name} <${email}>`, mobile ? `Mobile: ${mobile}` : "", `Locale: ${locale}`, "", message]);
  return { ok: true, notice: "contactSent" };
}
