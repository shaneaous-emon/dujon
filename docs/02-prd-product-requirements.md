# 02 — Product Requirements Document (PRD)

| Field | Value |
|---|---|
| Product | DUJON (দুজন) |
| Version | 1.0 (draft) |
| Date | 20 November 2026 |
| Status | Awaiting owner approval |

Priority scale: **Must** = required for MVP launch · **Should** = in MVP unless time forces deferral (owner decides) · **Could** = only if trivial · **Won't (MVP)** = out of scope.

Module codes: `PUB` public site · `I18N` language · `AUTH` authentication · `PROF` profile · `PREF` partner preferences · `LOC` locations · `DISC` discovery/search · `INT` interests & connections · `SAVE` saved profiles · `PHOTO` photos · `SAFE` safety (block/report) · `DASH` dashboard · `ACC` account settings · `SEO` search-engine optimisation.

Every functional requirement below has an acceptance criterion (AC). Detailed behaviour, validation and edge cases are in `03-srs-software-requirements.md` under the same IDs. Test cases are mapped in `requirements-traceability-matrix.md`.

---

## 1. Epics and user stories

| Story | As a… | I want to… | So that… | FRs |
|---|---|---|---|---|
| US-01 | visitor | understand what DUJON is and how it works in Bangla | I can decide whether to join | FR-PUB-001, 003, 005 |
| US-02 | visitor | read how DUJON keeps me safe and what it does not verify | I can trust it with my information | FR-PUB-004, FR-SAFE-005 |
| US-03 | visitor | switch between Bangla and English | I can use the language I am comfortable with | FR-I18N-001–003 |
| US-04 | visitor | start a search from the homepage | I get to relevant profiles quickly after signing up | FR-PUB-002 |
| US-05 | adult visitor | register with my email, password, gender and date of birth | I can create a profile | FR-AUTH-001–005, 013 |
| US-06 | person under 18 | be prevented from registering | the platform stays adults-only | FR-AUTH-002 |
| US-07 | member | log in, log out and reset a forgotten password | I can access my account securely | FR-AUTH-006–012 |
| US-08 | member | build my profile step by step | I am not overwhelmed by a long form | FR-PROF-001–003, 010 |
| US-09 | parent/guardian | indicate that I manage this profile for my son/daughter | others know who they are talking to | FR-PROF-010 |
| US-10 | member | choose my location from Division, District and Upazila/Thana lists | my location is accurate and consistent | FR-LOC-001–004 |
| US-11 | member | publish or hide my profile | I control when I am discoverable | FR-PROF-003, 004 |
| US-12 | member | set the age range and area I prefer | my searches start with sensible defaults | FR-PREF-001–003 |
| US-13 | member | search profiles by age range and location | I find relevant people | FR-DISC-001–009, 013 |
| US-14 | member | open a profile and see the important details at a glance | I can decide whether to express interest | FR-DISC-010, 011 |
| US-15 | member | upload one photo and choose who can see it | I feel safe sharing my picture | FR-PHOTO-001–007 |
| US-16 | member | express interest in someone | they know I am interested without me sharing my number publicly | FR-INT-001–003, 007 |
| US-17 | member | accept or decline interests I receive | I only connect with people I choose | FR-INT-004, 006, 010 |
| US-18 | connected member | see the other person's contact details after we both agree | we can talk to each other directly | FR-INT-008, FR-SAFE-004 |
| US-19 | member | save profiles to look at later | I don't lose track of people | FR-SAVE-001–003 |
| US-20 | member | block or report someone | I can protect myself and others | FR-SAFE-001–003, 006 |
| US-21 | member | see a simple dashboard of my profile status and interests | I know what needs my attention | FR-DASH-001, 002 |
| US-22 | member | change my password, language and notifications | the account works the way I want | FR-ACC-001–003, 006 |
| US-23 | member | delete my account | my data is removed when I leave | FR-ACC-005 |
| US-24 | visitor or member | contact the DUJON team | I can get help | FR-PUB-006 |
| US-25 | owner | have public pages found on Google in Bangla and English | the site grows organically | FR-SEO-001–008 |

---

## 2. Functional requirements and acceptance criteria

### 2.1 Public website (PUB)

| ID | Requirement | Priority | Acceptance criteria |
|---|---|---|---|
| FR-PUB-001 | Homepage with: hero (promise + primary CTA), search entry, "how it works" (3 steps), why DUJON (privacy, simplicity, respect), safety highlight, success-stories placeholder, FAQ teaser, final CTA, footer. | Must | Homepage renders all listed sections in both locales; contains exactly one `<h1>`; contains no member profile data. |
| FR-PUB-002 | Homepage search entry with age min/max and Division/District/Upazila selects. Guests are sent to registration with the search preserved; logged-in members go to `/search` with the filters. | Must | Guest submitting age 25–32 + Dhaka lands on `/register?next=/search?age_min=25&age_max=32&division=…`; after registration and publishing a profile, the first search uses those filters. Member submitting goes directly to `/search?...`. |
| FR-PUB-003 | "How it works" page explaining register → profile → search → express interest → connect. | Must | Page exists at `/how-it-works` and `/en/how-it-works` with the five steps. |
| FR-PUB-004 | Safety & privacy page, including an explicit statement that identity is not verified in this version. | Must | Page contains the verification-transparency paragraph from the copy sheet and safety tips. |
| FR-PUB-005 | FAQ page with at least the questions in the copy sheet (doc 05). | Must | FAQ renders as accessible accordion; each question is keyboard operable. |
| FR-PUB-006 | Contact page with form (name, email, optional mobile, subject, message). Messages are stored and emailed to the operator. Spam protection: honeypot + rate limit. | Must | Valid submission stores a `contact_messages` row, sends an operator email, shows success; 6th submission from same IP within an hour is rejected with a friendly message. |
| FR-PUB-007 | Terms & Conditions, Privacy Policy and Community Guidelines pages, each showing version and "last updated" date. | Must | Three pages exist in both locales; each shows version; drafts show a "pending legal review" banner in non-production environments only. |
| FR-PUB-008 | Success-stories section shows a clearly labelled "Success stories coming soon" message. No fabricated or demo testimonials in production. | Must | Production build contains no testimonial content; a test fails the build if demo-content markers appear in production pages. |
| FR-PUB-009 | Global header (logo, nav, language switcher, login/register or dashboard link) and footer (links to all public and legal pages, contact). | Must | Header and footer present on every public page; nav collapses into an accessible menu below 768 px. |
| FR-PUB-010 | Bilingual 404 and error pages. | Must | Unknown URL returns HTTP 404 with localized page and link home. |

### 2.2 Language (I18N)

| ID | Requirement | Priority | Acceptance criteria |
|---|---|---|---|
| FR-I18N-001 | Bangla is the default locale served without a prefix (`/…`); English is served under `/en/…`. No automatic browser-language redirect. | Must | First visit to `/` with `Accept-Language: en` still shows Bangla. |
| FR-I18N-002 | Visible "বাংলা \| English" switcher on every page that keeps the user on the equivalent page and query. | Must | Switching on `/faq` goes to `/en/faq`; on `/search?age_min=25` goes to `/en/search?age_min=25`. |
| FR-I18N-003 | Chosen language persists via cookie for guests and via `users.preferred_locale` for members. | Must | After choosing English, visiting `/` redirects to `/en`; after login on a new device, member's saved language is applied. |
| FR-I18N-004 | All UI text comes from message files (`bn.json`, `en.json`); no hard-coded user-facing strings. | Must | CI check fails if a key exists in one file but not the other, or if a lint rule detects literal JSX text. |
| FR-I18N-005 | In Bangla, numbers in UI (age, counts, dates) are displayed with Bangla digits. | Should | Age 28 renders "২৮ বছর" in `bn`, "28 years" in `en`. |
| FR-I18N-006 | Emails are sent in the recipient's preferred locale. | Must | A member with `preferred_locale=en` receives English email templates. |

### 2.3 Authentication (AUTH)

| ID | Requirement | Priority | Acceptance criteria |
|---|---|---|---|
| FR-AUTH-001 | Registration form: full name, email, mobile (optional), password, gender (male/female), date of birth, agreement checkbox (Terms + Privacy + 18+ declaration). | Must | Form submits successfully only when all required fields are valid; mobile may be empty. |
| FR-AUTH-002 | 18+ eligibility is enforced on the server using date of birth in Asia/Dhaka time. | Must | DOB making the user 17 years 364 days old is rejected by the API even if browser validation is bypassed; exactly 18 today is accepted. |
| FR-AUTH-003 | Registration does not reveal whether an email is already registered. | Must | Registering an existing email shows the same "check your email" response; the existing owner receives an "attempted registration" email; no duplicate account is created. |
| FR-AUTH-004 | Password policy: 8–128 characters, not in common-password list, not equal to email. | Must | "password123" is rejected; a 9-character uncommon passphrase is accepted. |
| FR-AUTH-005 | Acceptance of Terms and Privacy is recorded with document versions and timestamp. | Must | `users.terms_version`, `privacy_version`, `terms_accepted_at` are set on registration. |
| FR-AUTH-006 | Login with email + password; generic error on failure. | Must | Wrong email and wrong password both show "Email or password is incorrect". |
| FR-AUTH-007 | Logout ends the session on the server. | Must | After logout, reusing the old cookie returns unauthenticated. |
| FR-AUTH-008 | Sessions: opaque token in HTTP-only, Secure, SameSite=Lax cookie; 30-day sliding expiry; all sessions revoked on password change/reset. | Must | Cookie flags verified in E2E; after password reset, other browser is logged out. |
| FR-AUTH-009 | Forgot / reset password using a single-use emailed link valid 60 minutes; response is identical whether or not the email exists. | Must | Token works once; expired or reused token shows "link expired" with option to request a new one. |
| FR-AUTH-010 | Email verification link sent on registration (valid 24 h) with resend option. Login is not blocked. Verified email is required to send or accept interests when `REQUIRE_VERIFIED_EMAIL_FOR_INTERESTS=true` (default). | Must | Unverified member sees banner and cannot send interest; after verifying, can send. |
| FR-AUTH-011 | Rate limits on register, login, forgot password and verification resend (see SRS). | Must | 11th failed login for same email within 15 minutes returns HTTP 429 with localized message. |
| FR-AUTH-012 | Protected routes redirect guests to login with a same-origin `next` parameter. | Must | Guest opening `/dashboard` is redirected to `/login?next=/dashboard`; `next=https://evil.com` is ignored. |
| FR-AUTH-013 | After registration, the member is signed in and taken to profile set-up. | Must | New member lands on `/onboarding` step 1. |

### 2.4 Profile (PROF)

| ID | Requirement | Priority | Acceptance criteria |
|---|---|---|---|
| FR-PROF-001 | Guided set-up (onboarding) in 4 steps: (1) About you, (2) Location, (3) Photo (optional), (4) Partner preferences → review & publish. Each step saves a draft. | Must | Leaving after step 2 and returning resumes at step 3 with saved data. |
| FR-PROF-002 | Profile fields and validation as specified in SRS §4.2. | Must | Every field enforces the SRS rules on client and server. |
| FR-PROF-003 | A profile can be published only when required fields are complete: display name, marital status, education level, occupation, division, district, upazila/thana, about (≥ 30 characters). | Must | Publish button disabled with checklist until complete; API rejects publish with `PROFILE_INCOMPLETE` listing missing fields. |
| FR-PROF-004 | Member can hide and re-publish their profile. Hidden profiles are not discoverable. | Must | After hiding, profile disappears from others' searches immediately and direct profile URL returns 404 to others. |
| FR-PROF-005 | Member can edit profile at any time; changes apply immediately. | Must | Edited occupation appears on next profile view. |
| FR-PROF-006 | Other members see age (calculated), never full date of birth, and see display name, not full legal name. | Must | Profile detail and card HTML contain no DOB or full name. |
| FR-PROF-007 | Gender and date of birth are read-only after registration; UI explains how to request a correction. | Must | Profile edit form shows them read-only; API ignores/rejects attempts to change them (`FIELD_NOT_EDITABLE`). |
| FR-PROF-008 | Free-text fields reject phone numbers, email addresses and URLs, and are stored as plain text (no HTML). | Must | "Call me 01712345678" in About is rejected with a message explaining contact details are shared only after connecting. |
| FR-PROF-009 | "Preview my profile" shows the profile as an eligible member would see it. | Should | Preview matches the public card/detail layout and photo visibility. |
| FR-PROF-010 | Optional "Profile managed by": self / parent / guardian / sibling / relative. Displayed on the profile when not "self". | Must | Selecting "parent" shows "Managed by parent" badge on card and detail. |

### 2.5 Partner preferences (PREF)

| ID | Requirement | Priority | Acceptance criteria |
|---|---|---|---|
| FR-PREF-001 | Member sets preferred age range (required) and optionally division / district / upazila. | Must | Saved values persist and re-load in the form. |
| FR-PREF-002 | Default preference on first set-up: own age −5 to own age +5, clipped to [18, 70]. | Must | A 22-year-old gets default 18–27. |
| FR-PREF-003 | Preferences pre-fill discovery filters when `/search` is opened without filter query parameters. | Must | Opening `/search` uses preferences; opening `/search?age_min=30` uses 30 and other filters blank. |

### 2.6 Locations (LOC)

| ID | Requirement | Priority | Acceptance criteria |
|---|---|---|---|
| FR-LOC-001 | Bangladesh location hierarchy (8 divisions, 64 districts, upazilas + city-corporation thanas) is seeded from one versioned source file with Bangla and English names. | Must | Seed script loads all records; counts match dataset manifest. |
| FR-LOC-002 | Cascading selectors: division narrows districts; district narrows upazilas/thanas; changing a parent clears incompatible children. | Must | Changing division from Dhaka to Sylhet clears district and upazila; upazila list only shows children of selected district. |
| FR-LOC-003 | Server rejects inconsistent hierarchies. | Must | Submitting district Sylhet with division Dhaka returns `LOCATION_MISMATCH`. |
| FR-LOC-004 | Location names display in the current locale and sort alphabetically in that locale. | Must | Bangla UI shows "ঢাকা"; English shows "Dhaka". |

### 2.7 Discovery and search (DISC)

| ID | Requirement | Priority | Acceptance criteria |
|---|---|---|---|
| FR-DISC-001 | Discovery requires login and a published own profile (configurable). Members without a published profile see a prompt to complete it. | Must | Member with draft profile visiting `/search` sees "Publish your profile to start searching" and no results. |
| FR-DISC-002 | Discovery direction: male viewers see female profiles; female viewers see male profiles. Implemented in one server-side function. | Must | Integration test: male viewer never receives a male profile, female viewer never receives a female profile, across all query combinations. |
| FR-DISC-003 | Age range filter, inclusive, bounds 18–70 (configurable). | Must | With min 25 / max 30, profiles aged exactly 25 and exactly 30 are included; 24 and 31 excluded. |
| FR-DISC-004 | Invalid age ranges are rejected. | Must | min 35 / max 30 shows "Minimum age cannot be greater than maximum age"; API returns 400 `INVALID_AGE_RANGE`. |
| FR-DISC-005 | Optional division, district and upazila/thana filters following the hierarchy. | Must | Filtering by district Gazipur returns only profiles with district Gazipur. |
| FR-DISC-006 | "Clear filters" resets all filters (to blank, not to preferences). | Must | After clearing, URL is `/search` with `reset=1` and all filters empty. |
| FR-DISC-007 | Filter state is reflected in URL query parameters using IDs only. | Must | Copying the URL into another eligible member's browser shows the same filter values. |
| FR-DISC-008 | Results are paginated, 20 per page, sorted by most recently published, with stable ordering. | Must | Page 2 contains the next 20 without duplicates from page 1. |
| FR-DISC-009 | Results exclude: own profile; non-published profiles; profiles of non-active accounts; profiles blocked by or blocking the viewer; the other gender rule (FR-DISC-002). | Must | Each exclusion has a dedicated integration test (TC list). |
| FR-DISC-010 | Profile card shows: photo or placeholder (per visibility), display name, age, district + division, occupation, education level, marital status, "managed by" badge, Save and View actions. | Must | Card displays listed fields only. |
| FR-DISC-011 | Profile detail page shows all public profile fields and actions (Express Interest / status, Save, Block, Report). Access follows the same eligibility as discovery; otherwise 404. | Must | Male member opening another male's profile URL receives 404. |
| FR-DISC-012 | Empty state suggests widening age range or removing location filters. | Must | Zero results shows guidance and a "Clear filters" button. |
| FR-DISC-013 | Show total number of matching profiles. | Should | Header shows e.g. "৩২টি প্রোফাইল পাওয়া গেছে". |

### 2.8 Interests and connections (INT)

| ID | Requirement | Priority | Acceptance criteria |
|---|---|---|---|
| FR-INT-001 | Member can send "Express Interest" (আগ্রহ প্রকাশ করুন) from a profile, after a confirmation that explains contact details are shared only if the other person accepts. | Must | Confirm dialog appears; after confirming, status shows "Interest sent". |
| FR-INT-002 | Sending requires: sender has published profile, active account, verified email (configurable); target is discoverable by sender; neither has blocked the other. | Must | Each failing condition returns its own error code (see API spec). |
| FR-INT-003 | Only one interest per ordered pair at a time; if the target already sent an interest to the sender, the sender is offered "Accept their interest" instead. | Must | Second send returns `INTEREST_EXISTS`; reverse-pending case shows Accept button. |
| FR-INT-004 | Recipient can accept or decline a pending interest. | Must | Accept creates a connection; decline sets status declined. |
| FR-INT-005 | Sender can withdraw a pending interest. | Must | Withdrawn interest disappears from recipient's received list. |
| FR-INT-006 | After decline, the sender cannot send again to the same person for 30 days (configurable). The sender sees a neutral status "Not accepted". | Must | Re-send within 30 days returns `INTEREST_COOLDOWN`. |
| FR-INT-007 | Maximum 20 new interests per member per rolling 24 hours (configurable). | Must | 21st interest returns `INTEREST_DAILY_LIMIT`. |
| FR-INT-008 | Accepted interest = connection. Both members see each other's account email and mobile (if provided) on the profile page and in Connections, together with safety tips. | Must | Contact block is visible only to the two connected members; hidden after block or account deletion. |
| FR-INT-009 | Email notifications: new interest received; interest accepted. Members can switch these off. | Should | Notification email sent in recipient's locale; not sent when disabled. |
| FR-INT-010 | Interests page with tabs: Received (pending first), Sent, Connections. | Must | Each tab lists correct items with status and actions. |

### 2.9 Saved profiles (SAVE)

| ID | Requirement | Priority | Acceptance criteria |
|---|---|---|---|
| FR-SAVE-001 | Save/unsave a profile from card or detail page. | Should | Toggle persists across sessions. |
| FR-SAVE-002 | Saved list shows only profiles still eligible for the viewer. | Should | A saved profile that becomes hidden disappears from the list (and reappears if re-published). |
| FR-SAVE-003 | Saving is private; the other member is not notified. | Should | No notification or record visible to the saved member. |

### 2.10 Photos (PHOTO)

| ID | Requirement | Priority | Acceptance criteria |
|---|---|---|---|
| FR-PHOTO-001 | Upload one profile photo: JPEG, PNG or WebP; max 5 MB; min 400×400 px. | Must | 6 MB file or a `.exe` renamed `.jpg` is rejected with a clear message. |
| FR-PHOTO-002 | Server verifies file signature, re-encodes to WebP (800 px and 320 px versions), strips all metadata (EXIF/GPS), stores under random keys. | Must | Downloaded processed image contains no EXIF; storage keys contain no user data. |
| FR-PHOTO-003 | Photo visibility: "Members who can see my profile" (default) or "Only my connections". | Must | With "connections only", non-connected viewers see the placeholder. |
| FR-PHOTO-004 | Neutral placeholder (illustration, not a person) when no photo or not permitted. | Must | Placeholder used in card, detail and dashboard. |
| FR-PHOTO-005 | Photos are served only through an authorised app route with `Cache-Control: private`; storage is private; no public URLs. | Must | Logged-out request to photo route returns 404; direct storage URL is not accessible. |
| FR-PHOTO-006 | Replace or delete photo; old files are deleted from storage. | Must | After delete, previous photo route returns 404. |
| FR-PHOTO-007 | Upload screen shows photo guidelines and states photos are not reviewed before appearing in MVP. | Must | Guideline text from copy sheet present. |

### 2.11 Safety (SAFE)

| ID | Requirement | Priority | Acceptance criteria |
|---|---|---|---|
| FR-SAFE-001 | Block a member from profile page or interests list. Effects: mutual invisibility in search/profile/saved/interests; pending interests between them withdrawn; connection contact hidden. | Must | After A blocks B, neither sees the other anywhere; B is not notified. |
| FR-SAFE-002 | Blocked members list with unblock. | Must | Unblocking restores discoverability but not previous interests/connections. |
| FR-SAFE-003 | Report a member with reason (fake profile, inappropriate photo, harassment, asking for money/scam, appears under 18, married or misleading information, other) and optional details (≤ 1,000 chars). One open report per reporter–reported pair. Operator receives an email. | Must | Report row stored; operator email sent; duplicate open report returns `REPORT_EXISTS`. |
| FR-SAFE-004 | Safety tips shown with revealed contact details and on Safety page. | Must | Contact block contains safety-tips link/text. |
| FR-SAFE-005 | No "Verified", "NID verified", "Authentic member" or equivalent badge or claim anywhere. | Must | Automated copy test scans message files and rendered pages for banned terms. |
| FR-SAFE-006 | Report form offers "Also block this person" (checked by default). | Must | Submitting with box checked creates block + report. |
| FR-SAFE-007 | Because there is no admin panel in MVP, the operator gets command-line scripts to: list open reports, view a reported profile's moderation fields, suspend/unsuspend an account, and resolve/dismiss a report. Each action records who/when/why. | Must | Running `ops:suspend --user <publicId> --reason "…"` sets account suspended, hides profile, revokes sessions, and writes `moderation_actions` row. |

### 2.12 Dashboard (DASH)

| ID | Requirement | Priority | Acceptance criteria |
|---|---|---|---|
| FR-DASH-001 | Dashboard home: profile status (draft/published/hidden), completion checklist, email-verification banner, counts of pending received interests, connections and saved profiles, quick actions. | Must | Counts match database; checklist items link to the right step. |
| FR-DASH-002 | Dashboard navigation: Overview, My profile, Preferences, Interests, Saved, Settings, Logout. | Must | Nav works on mobile (bottom/tab or menu) and desktop (sidebar). |

### 2.13 Account settings (ACC)

| ID | Requirement | Priority | Acceptance criteria |
|---|---|---|---|
| FR-ACC-001 | Change password (current password required); revokes all other sessions. | Must | Other sessions invalid after change. |
| FR-ACC-002 | Change preferred language. | Must | Saved to `users.preferred_locale`; UI switches. |
| FR-ACC-003 | Email notification preferences (new interest, interest accepted). | Should | Toggles persist and are respected. |
| FR-ACC-004 | Add/change/remove optional mobile number (format-validated, not verified). Email change is handled via support in MVP. | Must | Valid BD mobile `01XXXXXXXXX` saved in E.164 `+8801XXXXXXXXX`. |
| FR-ACC-005 | Delete account: confirm with password and typed confirmation; account immediately deactivated, profile hidden, sessions revoked, pending interests withdrawn; personal data purged after 30 days (configurable) by scheduled job. | Must | After deletion, login fails with generic error; after purge job, personal data rows are removed/anonymised as per data dictionary. |
| FR-ACC-006 | "Log out of all devices". | Should | All sessions for user deleted. |

### 2.14 SEO

| ID | Requirement | Priority | Acceptance criteria |
|---|---|---|---|
| FR-SEO-001 | Unique localized `<title>` and meta description for each public page (doc 05 table). | Must | Metadata test asserts values per route and locale. |
| FR-SEO-002 | Open Graph and Twitter card tags with a default branded OG image (no people). | Must | Tags present on all public pages. |
| FR-SEO-003 | Canonical URL and `hreflang` alternates (`bn`, `en`, `x-default` → Bangla). | Must | Each public page has self-canonical and both alternates. |
| FR-SEO-004 | `sitemap.xml` lists only public pages in both locales. | Must | Sitemap contains no `/search`, `/profiles`, `/dashboard`, auth or API URLs. |
| FR-SEO-005 | `robots.txt` allows public pages and disallows private paths; links to sitemap. | Must | File matches doc 05 specification. |
| FR-SEO-006 | All authenticated, auth, profile and API responses send `noindex, nofollow` (meta and `X-Robots-Tag`). | Must | Test checks header on `/profiles/*`, `/search`, `/dashboard/*`, `/api/*`. |
| FR-SEO-007 | JSON-LD: `Organization` and `WebSite` on home; `FAQPage` on FAQ, matching visible content. | Should | Structured data validates in a schema validator. |
| FR-SEO-008 | Semantic HTML: one `<h1>` per page, logical heading order, landmark elements. | Must | Automated check passes on all public pages. |

---

## 3. Non-functional requirements

| ID | Category | Requirement | Measure |
|---|---|---|---|
| NFR-PERF-001 | Performance | Public pages meet "good" Core Web Vitals on mobile | p75 LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 (Lighthouse CI lab + Vercel Speed Insights field data) |
| NFR-PERF-002 | Performance | Search query performance | Server time p95 ≤ 600 ms with 50,000 synthetic demo profiles in staging |
| NFR-PERF-003 | Performance | JavaScript budget | First-load JS for public pages ≤ 200 KB gzipped |
| NFR-PERF-004 | Performance | Images responsive, modern format, lazy-loaded below the fold | Lighthouse "properly size images" passes |
| NFR-A11Y-001 | Accessibility | Conform to WCAG 2.2 Level AA | axe-core: zero serious/critical violations; manual keyboard and screen-reader check |
| NFR-A11Y-002 | Accessibility | Touch targets ≥ 44×44 px; visible focus ring | Design review + E2E check on key controls |
| NFR-A11Y-003 | Accessibility | Form errors explain how to fix and are announced | `aria-describedby`/`aria-invalid` present; error summary on submit |
| NFR-SEC-001 | Security | Requirements in `09-security-privacy-and-safety.md` §3–§8 | Security checklist passes before launch |
| NFR-PRIV-001 | Privacy | Collect only fields listed in the data dictionary; no religion, salary, NID, address, complexion | Schema review |
| NFR-I18N-001 | Language | 100 % of UI keys present in both locales; Bangla copy reviewed by a native speaker | CI key-parity check + sign-off |
| NFR-RESP-001 | Responsive | Layouts verified at 360, 414, 768, 1024, 1280, 1440 px widths | Playwright screenshots |
| NFR-COMP-001 | Compatibility | Latest 2 versions of Chrome, Edge, Firefox, Safari; Chrome on Android 10+; Safari on iOS 16+; Samsung Internet latest | Manual test matrix (doc 10) |
| NFR-REL-001 | Reliability | Daily database backups kept ≥ 14 days; restore tested before launch | Backup log + restore drill record |
| NFR-REL-002 | Reliability | Monthly availability target 99.5 % (best effort, hosting-dependent) | Uptime monitor |
| NFR-MAINT-001 | Maintainability | TypeScript `strict`, ESLint, Prettier; CI runs lint, type-check, tests, build | CI green required to merge |
| NFR-MAINT-002 | Maintainability | Business rules live in server-side service modules, not UI components | Code review checklist |
| NFR-OBS-001 | Observability | Errors logged with request ID; logs exclude passwords, tokens, DOB, phone, email body | Log review |

---

## 4. In scope / out of scope

See `mvp-scope-checklist.md`. Any change must be added to `13-open-decisions-and-assumptions.md` and approved by the owner before implementation.
