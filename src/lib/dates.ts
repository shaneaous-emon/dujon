import { appConfig } from "@/config/app";

export interface YMD {
  y: number;
  m: number;
  d: number;
}

/** Today's calendar date in Asia/Dhaka (business rules use Bangladesh time, docs/07 §1). */
export function todayInDhaka(now: Date = new Date()): YMD {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: appConfig.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return { y: get("year"), m: get("month"), d: get("day") };
}

export function pad(n: number, w = 2): string {
  return String(n).padStart(w, "0");
}

export function ymdToString({ y, m, d }: YMD): string {
  return `${pad(y, 4)}-${pad(m)}-${pad(d)}`;
}

export function parseYmd(s: string): YMD | null {
  const mt = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!mt) return null;
  const v = { y: Number(mt[1]), m: Number(mt[2]), d: Number(mt[3]) };
  return isValidYmd(v) ? v : null;
}

export function isValidYmd({ y, m, d }: YMD): boolean {
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) return false;
  if (y < 1900 || m < 1 || m > 12 || d < 1) return false;
  const dim = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return d <= dim;
}

/** Completed years between a birth date and `today`. */
export function ageOn(dob: YMD, today: YMD = todayInDhaka()): number {
  let age = today.y - dob.y;
  if (today.m < dob.m || (today.m === dob.m && today.d < dob.d)) age -= 1;
  return age;
}

export function ageFromDobString(dob: string, today: YMD = todayInDhaka()): number {
  const p = parseYmd(dob);
  return p ? ageOn(p, today) : 0;
}

/** Date `years` before `today` (29 Feb clamps to 28 Feb in non-leap years). */
export function subtractYears(today: YMD, years: number): YMD {
  const y = today.y - years;
  const dim = new Date(Date.UTC(y, today.m, 0)).getUTCDate();
  return { y, m: today.m, d: Math.min(today.d, dim) };
}

/**
 * Convert an age range to date-of-birth bounds (docs/07 §5):
 * dobMax = born on/before this date (age >= min); dobMinExclusive = born after this date (age <= max).
 */
export function dobBoundsForAges(minAge: number, maxAge: number, today: YMD = todayInDhaka()) {
  return {
    dobMax: ymdToString(subtractYears(today, minAge)),
    dobMinExclusive: ymdToString(subtractYears(today, maxAge + 1)),
  };
}
