# 09 — Security, Privacy and Safety

| Field | Value |
|---|---|
| Product | DUJON (দুজন) |
| Version | 1.0 (draft) |
| Date | 20 November 2026 |
| Status | Awaiting owner approval. **Not legal advice** — Bangladesh-qualified legal review required before launch |

---

## 1. Principles

1. **Privacy by default** — members are invisible to the public and search engines; contact details stay hidden until mutual acceptance.
2. **Honesty** — no identity verification exists in MVP, so nothing claims or implies it.
3. **Data minimisation** — no religion, NID, salary, address, complexion, body measurements or family finances.
4. **Defence in depth** — every rule enforced on the server; UI checks are convenience only.
5. **Least privilege** — separate database users and storage tokens per purpose.

## 2. Threat considerations (STRIDE-style summary)

| Threat | Example | Controls |
|---|---|---|
| Spoofing | Credential stuffing; stolen session | Argon2id, rate limits, generic errors, HttpOnly/Secure cookies, revocable DB sessions, logout-all |
| Tampering | Changing another user's profile/interest via ID manipulation (IDOR) | Actor-scoped `/me` endpoints, participant checks, public random IDs, 404 on mismatch |
| Repudiation | Disputed moderation actions | Append-only `moderation_actions` with actor/reason/time |
| Information disclosure | Scraping profiles; leaked phone numbers; EXIF GPS in photos; account enumeration | Login + published-profile gate, page cap & search rate limit, contact gating, EXIF stripping, private photo storage, enumeration-safe auth flows |
| Denial of service | Registration/interest spam | Rate limits, honeypots, daily interest limit, Vercel platform protections |
| Elevation of privilege | Member acting as admin | `role` column unused in MVP code paths; no admin endpoints exist |
| Abuse / harm | Scammers asking for money; harassment; minors | Email verification gate for interests, no free-text messaging, block/report, safety tips, under-18 report reason + suspension runbook |

## 3. Authentication security

| Control | Specification |
|---|---|
| Password hashing | Argon2id via `@node-rs/argon2` (memory ≥ 19 MiB, iterations ≥ 2, parallelism 1 — OWASP baseline; tune so a hash takes ~100–250 ms on Vercel) |
| Password policy | 8–128 chars; reject top-10k common passwords and passwords equal to email; no forced rotation |
| Sessions | 256-bit random token; only SHA-256 stored; cookie `HttpOnly; Secure; SameSite=Lax`; 30-day sliding; revoked on logout, password change/reset, suspension, deletion |
| Tokens (reset/verify) | 256-bit random; SHA-256 stored; single-use; 60 min / 24 h expiry |
| Enumeration | Same response for existing/non-existing email on register and forgot-password; login error generic |
| Brute force | Per-email and per-IP limits (doc 03 §5); dummy hash on unknown emails for timing parity |
| Redirects | `next` must be a same-origin relative path starting with `/` and not `//` |

## 4. Authorisation rules

| Resource | Rule |
|---|---|
| Own data (`/me/*`) | Actor only |
| Other profiles (list/detail/save) | `isDiscoverable(actor, target)` or existing connection |
| Photos | Owner; or discoverable + visibility `members`; or connected |
| Contact details | Only within an accepted, unblocked connection of two active accounts |
| Interests | Sender may withdraw; receiver may accept/decline; others get 404 |
| Reports | Create only; members cannot read reports |
| Ops scripts | Run by operator with `dujon_ops` DB credentials on a trusted machine; never exposed via HTTP |
| Cron | Bearer `CRON_SECRET` (random ≥ 32 bytes) |

All checks live in `src/server/policies` and are covered by integration tests (TC-049, 056–059, 061, 071, 079, 081, 113).

## 5. Input validation and output encoding

- Zod schemas on every input; reject unknown fields on mutation endpoints.
- Parameterised queries only (Drizzle); raw SQL only via tagged templates with bound parameters.
- Free text stored as plain text, rendered via React escaping; no `dangerouslySetInnerHTML` for user content.
- Contact-info guard on profile free text (doc 03 §4.2).
- Unicode normalisation (NFC) and removal of control/zero-width characters.
- File uploads: size limit, magic-byte check, re-encode with `sharp` (neutralises malicious payloads in image containers), max pixel count to prevent decompression bombs (`limitInputPixels`).

## 6. Web security

- HTTPS only + HSTS; security headers and CSP per doc 06 §10.
- CSRF: Server Action origin checks; same-origin `Origin` validation on REST mutations; SameSite=Lax.
- Clickjacking: `frame-ancestors 'none'`.
- Dependency hygiene: lockfile committed, Dependabot/Renovate alerts, `npm audit`/`pnpm audit` in CI (fail on high/critical in production dependencies).
- Secrets: only in Vercel environment variables / local `.env.local` (git-ignored); `.env.example` with placeholders; secret scanning enabled on GitHub.
- Error pages never show stack traces in production.

## 7. Photo privacy

| Measure | Detail |
|---|---|
| Storage | Private bucket; random object keys; no listing permissions for the app token beyond its prefix |
| Delivery | Authorised route; `Cache-Control: private`; presigned URLs ≤ 60 s if used |
| Metadata | All EXIF/XMP/IPTC removed (including GPS) |
| Visibility | `members` (default) or `connections` |
| Public exposure | Never in OG tags, sitemaps, emails or public pages |
| Limitation (disclosed) | Screenshots cannot be prevented on the web; photos are not pre-moderated in MVP |
| Removal | Member delete/replace; operator `ops:remove-photo` |

## 8. 18+ enforcement

1. Registration requires DOB; server computes age in Asia/Dhaka; under 18 → `UNDER_AGE`, no account created.
2. Declaration checkbox ("I am 18 or older").
3. DOB not editable by the member after registration.
4. Discovery query also excludes DOB > today − 18 years (defence in depth).
5. Report reason `appears_underage`; runbook: suspend immediately on credible report, review, then purge if confirmed.
6. Parents managing profiles must confirm the person is 18+ and consents (Terms + FAQ).
7. Limitation (disclosed in Terms): self-declared DOB is not verified in MVP.

## 9. Reporting, blocking and operations runbook

**Block** — immediate, silent, mutual invisibility; ends interests/connection (doc 03 §4.9).

**Report handling (no admin panel):**

| Step | Action | Target time (owner to confirm) |
|---|---|---|
| 1 | Ops email received ("[DUJON ops] New report #id: reason") | — |
| 2 | Run `ops:reports` and `ops:show --user <publicId>` | Within 24 h |
| 3 | Priority reasons `appears_underage`, `money_request_or_scam`, `harassment`: suspend first if credible (`ops:suspend`) | Within 24 h |
| 4 | Remove photo if inappropriate (`ops:remove-photo`) | Within 24 h |
| 5 | Resolve or dismiss with note (`ops:resolve-report`) | Within 72 h |
| 6 | If a crime is indicated, advise the reporter to contact 999 / police; preserve records; follow legal advice on disclosure requests | — |

**Contact-form safety messages** are triaged the same day where possible.

## 10. Data retention and deletion

See `07-database-design.md` §7. Summary:
- Account deletion: immediate hide + logout; full purge/anonymisation after 30 days.
- Reports and moderation actions retained 24 months (confirm with lawyer).
- Contact messages 12 months.
- Backups ≥ 14 days rolling; deleted data disappears from backups within the backup retention window.
- Members can request a copy of their data by contacting support (manual export in MVP); a self-service export is **[FUTURE]**.

## 11. Logging

- Structured JSON logs with `requestId`, route, status, duration, actor user ID (numeric internal ID, no email).
- Never log: passwords, tokens, cookies, full request bodies, DOB, phone numbers, emails, free text, photo bytes.
- Error monitoring service (e.g. Sentry free tier) is optional [OD-029]; if used, scrub PII and disable session replay.

## 12. Legal review checklist (Bangladesh)

> Status of law must be confirmed by a qualified lawyer at launch time. Background found during this documentation work: Bangladesh's **Personal Data Protection Ordinance, 2025** (Ordinance No. 61 of 2025) was gazetted in November 2025 together with the National Data Governance Ordinance, 2025, and was amended in February 2026 by the Personal Data Protection (Amendment) Ordinance, 2026. Reports describe obligations on data controllers, a sensitive-data category, and requirements concerning keeping certain categories of data within Bangladesh. Because these were ordinances issued by the interim government, their current status after the 2026 parliamentary transition must also be confirmed.

| # | Item | Owner | Status |
|---|---|---|---|
| L-01 | Confirm which data-protection law applies at launch and DUJON's obligations as data controller (registration, notices, consent, data-subject rights, breach notification, DPO requirements if any) | Lawyer | Open |
| L-02 | **Data location:** confirm whether any DUJON data (e.g. personal data of Bangladeshi citizens, or "sensitive"/"restricted" categories) must be stored or processed within Bangladesh — this directly affects using Vercel, Cloudflare R2 and any non-BD MySQL host | Lawyer | Open — **potential blocker for hosting choice** |
| L-03 | Whether DOB/gender/marital status/photos fall in a sensitive category requiring explicit consent | Lawyer | Open |
| L-04 | Cyber security law obligations (current cyber security ordinance/act), content takedown and law-enforcement request handling | Lawyer | Open |
| L-05 | Consumer protection / digital commerce rules relevant to a free online service | Lawyer | Open |
| L-06 | Trade licence and business registration for the operating entity; whether matchmaking services need any specific permission | Owner + Lawyer | Open |
| L-07 | Terms and Conditions (eligibility 18+, acceptable use, no verification disclaimer, limitation of liability, suspension, governing law Bangladesh) | Lawyer | Draft outline below |
| L-08 | Privacy Policy (data collected, purposes, legal basis/consent, sharing with connections, processors: hosting/storage/email, international transfers, retention, rights, contact) | Lawyer | Draft outline below |
| L-09 | Cookie notice: MVP uses only strictly necessary cookies (session, locale) + cookie-less analytics → short cookie statement in Privacy Policy; banner only if non-essential cookies are added | Lawyer | Open |
| L-10 | Community Guidelines | Owner | Draft outline below |
| L-11 | Photo/content licence and consent (member grants DUJON a limited licence to display their photo to eligible members; can withdraw by deleting) | Lawyer | Open |
| L-12 | Account deletion and data retention policy published | Owner | Open |
| L-13 | Parent/guardian-managed profiles: consent of the adult concerned | Lawyer | Open |
| L-14 | Future testimonials: written consent form with withdrawal process | Lawyer | Future |

### 12.1 Terms and Conditions — outline (placeholder, not legal text)
Who we are · Eligibility (18+, single/divorced/widowed and legally free to marry, Bangladesh) · Account responsibilities · Managed profiles (consent of the adult) · Acceptable use (no harassment, scams, money requests, commercial use, fake information, contact info in free text) · No identity verification; members responsible for their own safety · Interests and contact sharing · Content licence for photos/text · Suspension and termination · Disclaimers and limitation of liability · Changes to terms (versioning) · Governing law and disputes · Contact.

### 12.2 Privacy Policy — outline
Controller identity and contact · Data we collect (account, profile, photo, interactions, technical logs) and what we don't collect · Purposes · Legal basis/consent · Who can see what (table: visitors / members / connections / DUJON staff) · Processors (Vercel, MySQL host, Cloudflare R2, email provider, analytics) and their locations · Retention (doc 07 §7) · Your rights (access, correction, deletion, withdraw consent, complaint) · Security measures · Cookies · Children (no under-18s) · Changes · Contact.

### 12.3 Community Guidelines — outline
Be honest · Be respectful · Never ask for or send money · Keep contact details out of profile text · Use your own photo · Report concerns · Consequences (warning, photo removal, suspension) · Emergency: call 999.

## 13. Pre-launch security checklist

- [ ] All TC security cases pass (TC-112–115, IDOR suite)
- [ ] Security headers verified on production domain
- [ ] DB users least-privilege; TLS enforced; no root/admin DB credentials in Vercel
- [ ] R2 bucket private; app token scoped; CORS disabled or same-origin only
- [ ] `CRON_SECRET`, `SESSION` related secrets ≥ 32 random bytes; rotated from development values
- [ ] Demo data absent in production (TC-117)
- [ ] Backups configured and restore drill done (TC-116)
- [ ] Legal items L-01–L-13 resolved or consciously accepted by owner
- [ ] Safety page and Terms reviewed against actual MVP behaviour (no over-claims)
