import { appConfig } from "@/config/app";

export type MailLocale = "bn" | "en";
export type MailTemplate =
  | "verify-email"
  | "reset-password"
  | "registration-attempt"
  | "interest-received"
  | "interest-accepted"
  | "password-changed"
  | "account-deletion"
  | "ops-report"
  | "ops-contact";

export interface MailPayload {
  /** absolute URL for the single call-to-action button */
  url?: string;
  /** free text lines for ops mails */
  lines?: string[];
  subjectArg?: string;
}

interface Copy {
  subject: string;
  body: string[];
  button?: string;
}

const COPY: Record<Exclude<MailTemplate, "ops-report" | "ops-contact">, Record<MailLocale, Copy>> = {
  "verify-email": {
    bn: { subject: "দুজন: আপনার ইমেইল নিশ্চিত করুন", body: ["আপনার ইমেইল নিশ্চিত করতে নিচের বাটনে চাপ দিন। লিংকটি ২৪ ঘণ্টা কাজ করবে।", "আপনি অ্যাকাউন্ট না খুলে থাকলে এই বার্তা উপেক্ষা করুন।"], button: "ইমেইল নিশ্চিত করুন" },
    en: { subject: "DUJON: Confirm your email", body: ["Press the button below to confirm your email. The link works for 24 hours.", "If you didn't create an account, you can ignore this message."], button: "Confirm email" },
  },
  "reset-password": {
    bn: { subject: "দুজন: পাসওয়ার্ড রিসেট লিংক", body: ["নতুন পাসওয়ার্ড দিতে নিচের বাটনে চাপ দিন। লিংকটি ১ ঘণ্টা কাজ করবে।", "আপনি অনুরোধ না করে থাকলে এই বার্তা উপেক্ষা করুন; আপনার পাসওয়ার্ড বদলাবে না।"], button: "নতুন পাসওয়ার্ড দিন" },
    en: { subject: "DUJON: Reset your password", body: ["Press the button below to choose a new password. The link works for 1 hour.", "If you didn't ask for this, ignore this message — your password will not change."], button: "Set new password" },
  },
  "registration-attempt": {
    bn: { subject: "দুজন: আপনার ইমেইল দিয়ে নতুন অ্যাকাউন্টের চেষ্টা", body: ["কেউ আপনার ইমেইল দিয়ে দুজনে নতুন অ্যাকাউন্ট খোলার চেষ্টা করেছে। আপনার অ্যাকাউন্ট আগে থেকেই আছে।", "এটি আপনি হলে লগইন করুন বা পাসওয়ার্ড ভুলে গেলে রিসেট করুন। না হলে কিছু করতে হবে না।"], button: "লগইন পাতায় যান" },
    en: { subject: "DUJON: Someone tried to register with your email", body: ["Someone tried to create a new DUJON account with your email. You already have an account.", "If it was you, log in or reset your password. Otherwise no action is needed."], button: "Go to log in" },
  },
  "interest-received": {
    bn: { subject: "দুজন: নতুন একজন আপনার প্রতি আগ্রহ দেখিয়েছেন", body: ["একজন সদস্য আপনার প্রতি আগ্রহ দেখিয়েছেন। প্রোফাইল দেখতে লগইন করুন।", "আপনি গ্রহণ না করা পর্যন্ত কারো সঙ্গে আপনার যোগাযোগের তথ্য শেয়ার হবে না।"], button: "আগ্রহ দেখুন" },
    en: { subject: "DUJON: Someone is interested in you", body: ["A member has expressed interest in you. Log in to view their profile.", "Your contact details stay private until you accept."], button: "View interests" },
  },
  "interest-accepted": {
    bn: { subject: "দুজন: আপনার আগ্রহ গৃহীত হয়েছে", body: ["আপনার আগ্রহ গৃহীত হয়েছে। লগইন করে যোগাযোগের তথ্য দেখুন।", "প্রথম দেখা পাবলিক জায়গায় করুন, পরিবারকে জানিয়ে রাখুন, আর কখনো টাকা পাঠাবেন না।"], button: "সংযোগ দেখুন" },
    en: { subject: "DUJON: Your interest was accepted", body: ["Your interest was accepted. Log in to see the contact details.", "Meet in a public place first, tell your family, and never send money."], button: "View connection" },
  },
  "password-changed": {
    bn: { subject: "দুজন: আপনার পাসওয়ার্ড পরিবর্তন হয়েছে", body: ["আপনার অ্যাকাউন্টের পাসওয়ার্ড এইমাত্র পরিবর্তন হয়েছে।", "আপনি না করে থাকলে এখনই পাসওয়ার্ড রিসেট করুন এবং আমাদের জানান।"], button: "পাসওয়ার্ড রিসেট" },
    en: { subject: "DUJON: Your password was changed", body: ["The password of your account was just changed.", "If this wasn't you, reset your password now and contact us."], button: "Reset password" },
  },
  "account-deletion": {
    bn: { subject: "দুজন: অ্যাকাউন্ট মুছে ফেলার অনুরোধ পেয়েছি", body: ["আপনার অ্যাকাউন্ট মুছে ফেলার অনুরোধ পেয়েছি। প্রোফাইল এখন লুকানো আছে।", "আপনার ব্যক্তিগত তথ্য ৩০ দিনের মধ্যে স্থায়ীভাবে মুছে ফেলা হবে।"] },
    en: { subject: "DUJON: We received your account deletion request", body: ["We received your request to delete your account. Your profile is now hidden.", "Your personal data will be permanently deleted within 30 days."] },
  },
};

export interface Rendered {
  subject: string;
  text: string;
  html: string;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function absoluteUrl(path: string, locale: MailLocale): string {
  const prefix = locale === "en" ? "/en" : "";
  return `${appConfig.appUrl.replace(/\/$/, "")}${prefix}${path}`;
}

export function renderMail(template: MailTemplate, locale: MailLocale, payload: MailPayload): Rendered {
  if (template === "ops-report" || template === "ops-contact") {
    const subject = template === "ops-report" ? `[DUJON ops] New report ${payload.subjectArg ?? ""}` : `[DUJON ops] Contact form: ${payload.subjectArg ?? ""}`;
    const lines = payload.lines ?? [];
    return { subject, text: lines.join("\n"), html: `<pre style="font-family:monospace">${esc(lines.join("\n"))}</pre>` };
  }
  const c = COPY[template][locale];
  const text = [...c.body, payload.url && c.button ? `${c.button}: ${payload.url}` : "", "— DUJON"].filter(Boolean).join("\n\n");
  const html = `<!doctype html><html lang="${locale}"><body style="margin:0;background:#fbf8f3;font-family:'Noto Sans Bengali',Inter,Arial,sans-serif;color:#1f1b1a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="480" style="max-width:480px;background:#fff;border-radius:12px;padding:28px">
<tr><td style="font-size:22px;font-weight:700;color:#7a2e3b">${locale === "bn" ? "দুজন" : "DUJON"}</td></tr>
${c.body.map((p) => `<tr><td style="padding-top:16px;font-size:16px;line-height:1.6">${esc(p)}</td></tr>`).join("")}
${payload.url && c.button ? `<tr><td style="padding-top:24px"><a href="${esc(payload.url)}" style="display:inline-block;background:#7a2e3b;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600">${esc(c.button)}</a></td></tr>` : ""}
</table></td></tr></table></body></html>`;
  return { subject: c.subject, text, html };
}
