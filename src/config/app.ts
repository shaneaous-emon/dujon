/**
 * Central application configuration (docs/03 §2).
 * Values may be overridden by environment variables; defaults match the approved docs.
 */
function intFromEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function boolFromEnv(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;
  return raw === "true" || raw === "1";
}

export const appConfig = {
  appEnv: (process.env.APP_ENV ?? "development") as "development" | "preview" | "production",
  appUrl: process.env.APP_URL ?? "http://localhost:3000",
  timezone: "Asia/Dhaka",
  minRegistrationAge: intFromEnv("MIN_REGISTRATION_AGE", 18),
  maxRegistrationAge: intFromEnv("MAX_REGISTRATION_AGE", 100),
  searchAgeMinBound: intFromEnv("SEARCH_AGE_MIN_BOUND", 18),
  searchAgeMaxBound: intFromEnv("SEARCH_AGE_MAX_BOUND", 70),
  searchPageSize: intFromEnv("SEARCH_PAGE_SIZE", 20),
  searchMaxPage: intFromEnv("SEARCH_MAX_PAGE", 50),
  requirePublishedProfileToSearch: boolFromEnv("REQUIRE_PUBLISHED_PROFILE_TO_SEARCH", true),
  requireVerifiedEmailForInterests: boolFromEnv("REQUIRE_VERIFIED_EMAIL_FOR_INTERESTS", true),
  interestDailyLimit: intFromEnv("INTEREST_DAILY_LIMIT", 20),
  interestDeclineCooldownDays: intFromEnv("INTEREST_DECLINE_COOLDOWN_DAYS", 30),
  sessionTtlDays: intFromEnv("SESSION_TTL_DAYS", 30),
  passwordResetTtlMinutes: intFromEnv("PASSWORD_RESET_TTL_MINUTES", 60),
  emailVerifyTtlHours: intFromEnv("EMAIL_VERIFY_TTL_HOURS", 24),
  accountPurgeAfterDays: intFromEnv("ACCOUNT_PURGE_AFTER_DAYS", 30),
  photoMaxBytes: intFromEnv("PHOTO_MAX_BYTES", 5 * 1024 * 1024),
  photoMinDimension: intFromEnv("PHOTO_MIN_DIMENSION", 400),
  termsVersion: process.env.TERMS_VERSION ?? "2026-11-v1",
  privacyVersion: process.env.PRIVACY_VERSION ?? "2026-11-v1",
} as const;

export const isProduction = appConfig.appEnv === "production";
