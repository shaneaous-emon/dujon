# 13 — Open Decisions and Assumptions

| Field | Value |
|---|---|
| Product | DUJON (দুজন) |
| Version | 1.0 (draft) |
| Date | 20 November 2026 |
| Status | **All recommended defaults approved by the owner on 2026-11-20.** OD-024/OD-025 values still to be supplied. Implementation started (M1). |

Each decision has a recommended default so documentation could be completed without blocking. All defaults are reflected consistently across the pack; if the owner changes one, the "Impact if changed" column lists the documents to update.

---

## 1. Decisions requiring owner approval

| ID | Decision | Recommended default | Why | Impact if changed | Approval |
|---|---|---|---|---|---|
| OD-001 | Registration identifier: email and/or mobile? | **Email required** (login + reset); **mobile optional**, private, shown only to connections | Without SMS OTP a mobile number cannot be verified or used safely for password reset; email reset is free | Mobile-only login needs SMS OTP (cost) → docs 02, 03, 07, 08, 09 | ☑ Approved 2026-11-20 |
| OD-002 | Email verification | Sent on registration; login not blocked; **verified email required to send/accept interests** (config flag) | Cheap friction against throwaway spam accounts; not identity verification | If off: more spam risk; flip `REQUIRE_VERIFIED_EMAIL_FOR_INTERESTS` | ☑ Approved 2026-11-20 |
| OD-003 | Can logged-out visitors browse profiles? | **No.** Homepage search leads to register/login with filters preserved | Privacy and scraping protection; matches "not indexed by default" | Public browsing → new privacy policy, blurred cards, SEO rules (docs 02, 04, 05, 09) | ☑ Approved 2026-11-20 |
| OD-004 | What is revealed on mutual interest? | Account **email + mobile (if provided)** of both members | Simplest safe contact flow without building chat | Alternative "chat only" → large new feature | ☑ Approved 2026-11-20 |
| OD-005 | Default photo visibility | **"Members who can see my profile"**, with "Only my connections" option shown at upload | Balances engagement and privacy; women can choose stricter setting | Default "connections" → fewer photos visible in search | ☑ Approved 2026-11-20 |
| OD-006 | "Profile managed by" field | **Include**: self / parent / guardian / sibling / relative | Common in Bangladesh; signals who is communicating | Remove → docs 03, 04, 05, 07 | ☑ Approved 2026-11-20 |
| OD-007 | Marital status options | never_married / divorced / widowed | Matches brief's simple model | Add "separated", "annulled" → enum change | ☑ Approved 2026-11-20 |
| OD-008 | Education | Controlled level list + optional free-text detail | Comparable and searchable later; simple to fill | Free text only → loses structure | ☑ Approved 2026-11-20 |
| OD-009 | Age bounds | Registration ≥ 18 (≤ 100); search 18–70; default preference = own age ±5 | Brief: configurable, no permanent hard limit | Config only | ☑ Approved 2026-11-20 |
| OD-010 | Saved profiles in MVP | **Include** (Should priority) | Low effort, useful | Defer → remove FR-SAVE-* | ☑ Approved 2026-11-20 |
| OD-011 | Featured/recent profiles on public homepage | **None in MVP** | Members not public by default; no consent model yet | Opt-in showcase is future work | ☑ Approved 2026-11-20 |
| OD-012 | Email delivery | SMTP from owner's hosting (Mailpit locally) | No extra cost | Transactional provider (Resend/SES/Brevo) — env change only, small monthly cost | ☑ Approved 2026-11-20 |
| OD-013 | Photo storage | **Cloudflare R2 private bucket** (S3 API) | No persistent disk on Vercel; low cost; portable | Owner server storage (MinIO) if legal requires in-country storage (L-02) | ☑ Approved 2026-11-20 |
| OD-014 | Hosting | **Vercel Pro + owner's MySQL 8**, subject to P-1/P-2 checks | Brief preference; simple deploys | Option B (owner VPS) or C (managed MySQL) — doc 06 §8 | ☑ Approved 2026-11-20 |
| OD-015 | ORM | **Drizzle** | Pooling control, SQL transparency, light serverless footprint | Prisma — docs 06, 12 | ☑ Approved 2026-11-20 |
| OD-016 | Interest limits | 20 new/24 h; 30-day cooldown after decline | Anti-spam with low friction | Config values | ☑ Approved 2026-11-20 |
| OD-017 | Account deletion | Immediate hide + logout; purge after **30 days**; final (no undo) | Allows safety investigations and backup cycle; simple | Undo window → extra "restore" flow | ☑ Approved 2026-11-20 |
| OD-018 | Brand name DUJON | Working name; complete clearance checklist (doc 00 §9) | Brief requirement | Rename = copy, logo, domain, metadata | ☑ Approved 2026-11-20 |
| OD-019 | Height | Entered and shown in feet/inches; stored in cm | Familiar in Bangladesh | Display in cm → copy only | ☑ Approved 2026-11-20 |
| OD-020 | Gender options | Male / Female in UI; discovery via one policy function | Brief: simple MVP, extensible model | Broader options → policy + UI change, no schema rewrite | ☑ Approved 2026-11-20 |
| OD-021 | Member profile indexing | **OFF** | Brief requirement | Consent-based public profiles = future policy | ☑ Approved 2026-11-20 |
| OD-022 | Analytics | Vercel Web Analytics + Speed Insights (cookie-less) | No consent banner needed | Google Analytics → cookie consent banner + Privacy Policy update | ☑ Approved 2026-11-20 |
| OD-023 | Monetisation | **Free; no payments in MVP** | Brief lists no payment features | Paid plans = new module | ☑ Approved 2026-11-20 |
| OD-024 | Legal operating entity | `<company/person name>` for Terms/Privacy | Required for legal pages | — | ☑ Approved 2026-11-20 |
| OD-025 | Support details | Ops email `<…>`, support response time `<…>` | Needed for Contact, emails, reports | — | ☑ Approved 2026-11-20 |
| OD-026 | Religion field | **Not collected** in MVP (brief) — flagged risk R-07 | Brief excludes; sensitive data under PDPO | Adding later needs privacy review, consent, filter design | ☑ Approved 2026-11-20 |
| OD-027 | Must members publish before they can search? | **Yes** (config flag) | Prevents anonymous browsing; reciprocity | If no → anyone logged in can browse | ☑ Approved 2026-11-20 |
| OD-028 | Email change | Via support in MVP | Avoids building re-verification flow | Self-service change → new flow + tests | ☑ Approved 2026-11-20 |
| OD-029 | Error monitoring | Vercel logs only in MVP; optional Sentry free tier with PII scrubbing | Cost/privacy | Add Sentry → privacy policy processor list | ☑ Approved 2026-11-20 |
| OD-030 | Photo backups | None in MVP | Members can re-upload | Weekly bucket sync | ☑ Approved 2026-11-20 |
| OD-031 | City-corporation thanas in location list | **Include** as `type='thana'` | Urban users (Dhaka, Chattogram etc.) identify by thana | Without → urban locations less precise | ☑ Approved 2026-11-20 |
| OD-032 | Free-text contact-info blocking | **Block** phone/email/URL in profile text | Protects contact gating and members' privacy | If allowed → contact gating can be bypassed | ☑ Approved 2026-11-20 |

## 2. Assumptions recorded (no decision needed unless owner disagrees)

| ID | Assumption |
|---|---|
| AS-01 | MVP market is Bangladesh only; all users are in Bangladesh time zone for business rules. |
| AS-02 | One account = one profile. A parent managing two children's profiles uses two accounts (mobile may be shared). |
| AS-03 | Gender and DOB are fixed after registration; corrections via support. |
| AS-04 | No free-text messaging in MVP; interests carry no message. |
| AS-05 | Operator handles reports via scripts and email; no admin UI. |
| AS-06 | Bangla copy in doc 05 is a draft to be reviewed by a native editor. |
| AS-07 | Illustrative images will be licensed stock or generated editorial imagery, recorded in a licence file and never presented as members. |
| AS-08 | Expected MVP scale ≤ 50,000 published profiles; architecture revisited beyond that. |
| AS-09 | The owner's MySQL server is MySQL 8.0.16+ (to be confirmed in P-1). |
| AS-10 | Hidden profiles keep existing connections. |

## 3. Contradictions, gaps and risks found in the brief

| # | Observation | Resolution in this pack |
|---|---|---|
| C-01 | Registration allows "email and/or mobile", but SMS OTP is excluded — an unverified mobile cannot securely support login or password reset | Email required, mobile optional (OD-001) |
| C-02 | "Date of birth or age" — age alone becomes inaccurate and weakens 18+ checks | DOB required; age derived |
| C-03 | Homepage should feel "active" with recent profiles, but profiles must not be public by default and fabricated content is banned | No member profiles on public pages; honest "coming soon" stories; cold-start copy (OD-011) |
| C-04 | No admin panel, yet reports and suspensions must be handled | Ops CLI scripts + `moderation_actions` audit (FR-SAFE-007) |
| C-05 | Vercel + owner's MySQL: shared hosts often block remote DB access or cap connections | Pre-checks P-1/P-2 and fallback options (doc 06 §8) |
| C-06 | Vercel Hobby plan is for non-commercial use | Plan for Pro (cost to owner) |
| C-07 | Bangladesh PDPO 2025 (amended 2026) may contain in-country data requirements, which could conflict with Vercel/R2 hosting | Legal item L-02 is a pre-implementation check (P-3) |
| C-08 | Account deletion requires a scheduled purge, but no background-job infrastructure is mentioned | Vercel Cron daily job |
| C-09 | "Upazila / Thana": standard upazila datasets omit metropolitan thanas | `type='thana'` entries (OD-031) |
| C-10 | Religion is excluded, though it is a primary filter for many Bangladeshi users | Kept out per brief; flagged as product risk R-07 (OD-026) |

## 4. Essential questions for the owner

Only these block implementation; everything else has a safe default above.

1. **MySQL server details** (doc 12 §3.1): provider, MySQL version, remote access, connection limits, location.
2. **Legal:** can you engage a Bangladesh lawyer to answer L-02 (data location) before we choose hosting?
3. **Approve or change** OD-001, OD-003, OD-004, OD-005, OD-014 and OD-023 — they shape the core user experience and cost.
4. **Operating entity name and support email** (OD-024, OD-025) for legal pages and emails.

## 5. Change log

| Date | Change | By |
|---|---|---|
| 2026-11-20 | Initial decision register | Claude (documentation) |
| 2026-11-20 | Owner approved all recommended defaults; code to live in a folder on the owner's computer | Owner |
