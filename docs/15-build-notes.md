# 15 — Build notes (M2–M9 implementation)

Status: all modules implemented and tested locally on 2026-11-20.

## Deviations from the plan (documented)
- **Data layer:** `mysql2` with plain SQL and SQL migrations (`db/migrations`, `pnpm db:migrate`) instead of Drizzle. Dev DB is MariaDB 10.11; production target is MySQL 8.0.16+.
- **Mail:** `mail_outbox` table; `MAIL_DRIVER=file` (dev/tests) or `smtp`.
- **Mutations:** Next.js server actions; REST only for photos, health, locations, and the cron purge.
- **Enumeration tradeoff:** register/forgot-password do not reveal whether an email exists (FR-AUTH-003) which slightly weakens FR-AUTH-013 messaging.
- **Legal text** is a structured draft; a banner shows until `LEGAL_CONTENT_REVIEWED=true`.
- **No "Verified" badge**, no SMS OTP/NID/selfie, no fabricated members or testimonials. `pnpm seed:demo` (dev only, refuses production) creates clearly labelled `[DEMO]` rows.

## Verified
typecheck, lint, i18n parity, 15 unit tests, production build (no warnings), Playwright: full journey (register → onboarding → publish → opposite-gender search → email confirm → interest → accept → contact reveal → block → account deletion), axe a11y on 10 pages × desktop/mobile, language and security-header tests.

## Not done / needs the owner
- Public hosting (Vercel, domain, hosted MySQL, SMTP, R2/S3) — accounts needed; see `vercel.json` and `.env.example`.
- Lawyer review of terms/privacy and data-location decision (risk L-02).
- Review of Bangla thana names (data/locations).
