/** Pure validation helpers shared by server actions and tests (docs/03 §6). */

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

export function bnToAsciiDigits(input: string): string {
  return input.replace(/[০-৯]/g, (c) => String(BN_DIGITS.indexOf(c)));
}

export function normalizeEmail(input: string): string {
  return input.trim().toLowerCase();
}

export function isValidEmail(input: string): boolean {
  const e = normalizeEmail(input);
  return e.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
}

/**
 * Accepts 01XXXXXXXXX, +8801XXXXXXXXX, 8801XXXXXXXXX (Bangla or Latin digits) and returns +8801XXXXXXXXX, else null.
 * Operator digit (3rd character of the national number) must be 3–9.
 */
export function normalizeBdMobile(input: string): string | null {
  const compact = bnToAsciiDigits(input).replace(/[\s\-()]/g, "");
  const m = /^(?:\+?880|0)(1[3-9]\d{8})$/.exec(compact);
  return m ? `+880${m[1]}` : null;
}

/** 01712-345678 style, for showing a connected member's number. */
export function formatBdMobile(e164: string): string {
  const m = /^\+880(1\d)(\d{4})(\d{4})$/.exec(e164);
  return m ? `0${m[1]}${m[2]}${m[3]}` : e164;
}

const COMMON_PASSWORDS = new Set(
  [
    "password","password1","password12","password123","12345678","123456789","1234567890","qwerty123","qwertyuiop","iloveyou",
    "11111111","00000000","abc12345","abcd1234","admin123","letmein1","welcome1","welcome123","bangladesh","bangladesh1",
    "dhaka1234","dujon123","dujon1234","11223344","987654321","1q2w3e4r","1qaz2wsx","asdfghjkl","zxcvbnm1","passw0rd",
    "monkey123","dragon123","football1","sunshine1","princess1","baseball1","master123","shadow123","superman1","michael123",
    "01711111111","01811111111","01911111111","123123123","12341234","aaaaaaaa","qwer1234","pass1234","test1234","user1234",
  ].map((s) => s.toLowerCase()),
);

export type PasswordProblem = "short" | "long" | "common" | null;

export function checkPassword(password: string, email?: string): PasswordProblem {
  if (password.length < 8) return "short";
  if (password.length > 128) return "long";
  const lower = password.toLowerCase();
  if (COMMON_PASSWORDS.has(lower)) return "common";
  if (email && lower === normalizeEmail(email)) return "common";
  if (/^(.)\1+$/.test(password)) return "common";
  return null;
}

/** Detects phone numbers, e-mail addresses and links in free text (FR-PROF-010). */
export function containsContactInfo(text: string): boolean {
  const t = bnToAsciiDigits(text);
  if (/[^\s@]+@[^\s@]+\.[^\s@]+/.test(t)) return true;
  if (/(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|info|bd|xyz|me|co|io|app|link)\b)/i.test(t)) return true;
  if (/(wa\.me|whatsapp|telegram|t\.me|imo\b|facebook\.com|fb\.com|messenger)/i.test(t)) return true;
  const digitsOnly = t.replace(/[\s\-().+]/g, "");
  if (/\d{8,}/.test(digitsOnly)) return true;
  if (/(?:\+?880|\b0)1[3-9][\d\s\-]{8,}/.test(t)) return true;
  return false;
}

export function cleanText(input: string, max: number): string {
  return input.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim().slice(0, max);
}
