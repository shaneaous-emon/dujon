# 01 — Business Requirements Document (BRD)

| Field | Value |
|---|---|
| Product | DUJON (দুজন) |
| Version | 1.0 (draft) |
| Date | 20 November 2026 |
| Status | Awaiting owner approval |

---

## 1. Business objectives

| ID | Objective | How MVP supports it |
|---|---|---|
| BO-1 | Launch a credible, modern Bangladeshi matchmaking website with a small, affordable MVP | Focused feature set, single Next.js app, owner's existing MySQL |
| BO-2 | Earn trust in a market where fake profiles and scams are common | Honest no-verification messaging, mutual-interest contact flow, block/report, privacy defaults |
| BO-3 | Be easier to use than incumbent sites, especially on mobile | Mobile-first UX, short registration, guided profile set-up, four filters only |
| BO-4 | Build a foundation for an admin panel, identity verification and a mobile app later | Service layer separated from UI, versioned REST API, role and status fields in the database |
| BO-5 | Build organic discovery through search engines without exposing members | SEO for public pages; member profiles never indexed |

## 2. Stakeholders

| Stakeholder | Role | Interest |
|---|---|---|
| Owner / Product owner | Funds, approves scope, operates the service | Low cost, credibility, growth |
| Members (self-managed) | Create profile, search, express interest | Easy, safe, private, relevant matches |
| Members' families (guardian-managed profiles) | Manage an adult relative's profile | Respectful presentation, control over contact |
| Developer(s) using Claude Code | Build and maintain | Clear, consistent specification |
| Operations contact (owner initially) | Reads reports and contact messages, handles takedowns | Simple runbook, email notifications |
| Legal adviser (Bangladesh-qualified) | Reviews terms, privacy policy, data handling | Compliance before launch |
| Hosting providers (Vercel, MySQL host, object storage, SMTP) | Infrastructure | Correct configuration and plan limits |

## 3. User groups

| Group | Description | Permissions summary |
|---|---|---|
| Guest | Not logged in | Public pages, register, login, contact form. **Cannot view member profiles or photos.** |
| Member — incomplete | Registered, profile not yet published | Edit own profile, set preferences, account settings. Can search? **No** — must publish own profile first **[ASSUMPTION, OD-027]** |
| Member — published | Registered with a published profile | Search, view eligible profiles, save, express interest, respond, block, report |
| Member — hidden | Member who hid their own profile | Same as incomplete: not discoverable, cannot search or send new interests; can still see existing connections |
| Suspended account | Set by operations (manually in MVP) | Cannot log in; profile not discoverable |
| Admin **[FUTURE]** | Moderation and support staff | Role exists in data model only |

Rationale for "must publish to search": it prevents silent browsing by people who expose nothing about themselves, which is a common complaint and a safety risk. It is configurable (`REQUIRE_PUBLISHED_PROFILE_TO_SEARCH`).

## 4. Business requirements

| ID | Requirement | Priority | Source |
|---|---|---|---|
| BR-001 | The platform shall allow only adults aged 18+ to register and use matchmaking features. | Must | Brief §4, §15 |
| BR-002 | The platform shall be bilingual (Bangla default, English secondary) across all user-facing text. | Must | Brief §7 |
| BR-003 | The platform shall let a member find opposite-gender profiles filtered by age range and Bangladesh location. | Must | Brief §6.4 |
| BR-004 | The platform shall keep members' contact details private until both members agree to connect. | Must | Brief §6.5 |
| BR-005 | The platform shall never claim identity verification or genuineness it does not perform. | Must | Brief §16 |
| BR-006 | The platform shall never display fabricated members, testimonials, statistics or success stories. | Must | Brief §6.8, Part A |
| BR-007 | The platform shall give members control over their photo visibility and profile publication. | Must | Brief §6.3, §6.7 |
| BR-008 | The platform shall let members block and report other members. | Must | Brief §15–16 |
| BR-009 | The platform shall let members delete their account and data. | Must | Brief §6.6, §15 |
| BR-010 | Public pages shall be discoverable by search engines; member data shall not be. | Must | Brief §9 |
| BR-011 | The solution shall use MySQL and be deployable from GitHub to Vercel (or an equivalent documented alternative). | Must | Brief §12 |
| BR-012 | The architecture shall allow a future admin panel and mobile app without major refactoring. | Must | Brief §14 |
| BR-013 | The MVP shall be affordable to build and run, avoiding paid verification, SMS and AI services. | Must | Brief Part A, §6.2 |
| BR-014 | The platform shall provide a way for the public and members to contact the operator. | Must | Brief §6.1 |
| BR-015 | The platform shall present Terms, Privacy Policy and Community Guidelines and record members' acceptance. | Must | Brief §6.2, §17 |

## 5. Business rules

| ID | Rule |
|---|---|
| BRL-01 | Minimum age is 18, calculated from date of birth in the Asia/Dhaka timezone on the day of the action. |
| BRL-02 | Default discovery direction: male → female, female → male. |
| BRL-03 | A member's date of birth and gender cannot be changed by the member after registration; corrections go through support (prevents gaming of age/gender rules). |
| BRL-04 | Contact details are revealed only within an accepted connection, and are removed from view if either member blocks the other or deletes their account. |
| BRL-05 | A declined interest cannot be re-sent to the same member for 30 days (configurable). |
| BRL-06 | A member may send at most 20 new interests per rolling 24 hours (configurable). |
| BRL-07 | Profiles of suspended, deactivated or deletion-pending accounts are never discoverable. |
| BRL-08 | Blocking is mutual in effect: neither member sees the other in search, profile pages, saved lists or interests. |
| BRL-09 | Member profiles and photos are never visible to logged-out visitors or indexed by search engines. |
| BRL-10 | Testimonials may only be published with written, withdrawable consent **[FUTURE content type]**. |
| BRL-11 | Account deletion hides the profile immediately and permanently removes personal data after a 30-day grace period (configurable), except minimal records required for safety (see `09-security-privacy-and-safety.md`). |
| BRL-12 | The MVP is free to use; there are no paid features **[ASSUMPTION, OD-023]**. |

## 6. Success metrics

No targets are claimed as facts. The owner should set targets after the first month of real data. Suggested metrics and how to measure them (SQL over the production database; privacy-friendly page analytics for traffic):

| ID | Metric | Definition |
|---|---|---|
| SM-1 | Registrations | New accounts per week |
| SM-2 | Profile completion rate | % of new accounts that publish a profile within 7 days |
| SM-3 | Gender balance | Ratio of published female to male profiles (marketplace health; critical for discovery quality) |
| SM-4 | Search engagement | % of published members who run at least one search per week |
| SM-5 | Interest activity | Interests sent per weekly active member |
| SM-6 | Acceptance rate | Accepted ÷ (accepted + declined) interests |
| SM-7 | Connections | Accepted connections per week |
| SM-8 | Safety | Reports per 1,000 published profiles; median time to action a report |
| SM-9 | Retention | % of members who return 7 and 30 days after registering |
| SM-10 | Organic traffic | Search-engine sessions to public pages |

## 7. Constraints

- Database must be **MySQL** (owner's server) [CONFIRMED].
- No paid identity, SMS or AI services in MVP [CONFIRMED].
- Vercel serverless functions have no persistent local filesystem → photos must go to external storage.
- Vercel's Hobby plan is restricted to non-commercial use; a commercial service like DUJON should plan for the **Pro plan** (owner to confirm current pricing and terms).
- Legal templates in this pack are not legal advice; a Bangladesh-qualified lawyer must review them before launch.

## 8. Risk register

| ID | Risk | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|---|
| R-01 | Fake profiles and scammers, since no identity verification exists | High | High | Honest messaging; mutual-interest contact reveal; interest rate limits; report/block; email verification required before interests; manual suspension runbook; plan verification for phase 2 | Owner |
| R-02 | Gender imbalance (far more male than female members) degrades the product for both sides | High | High | Women-first privacy features (photo visibility, contact gating); marketing aimed at women and families; monitor SM-3 weekly | Owner |
| R-03 | Owner's MySQL host blocks remote connections or has low connection limits, breaking Vercel deployment | Medium | High | Pre-launch connectivity test (see doc 12); small connection pools; fallback: deploy Next.js on owner's VPS/Node host, or managed MySQL | Dev |
| R-04 | Harassment through interests or after contact reveal | Medium | High | No free-text messages in MVP; contact only after mutual acceptance; blocking hides contact; report flow; community guidelines | Owner |
| R-05 | Non-compliance with Bangladesh data-protection law (Personal Data Protection Ordinance 2025, amended 2026), including any data-location requirements | Medium | High | Data minimisation; lawyer review before launch; confirm whether hosting outside Bangladesh is permitted for this data | Owner + Legal |
| R-06 | Cold start — searches return few or no results at launch | High | Medium | Friendly empty states; broaden-filter suggestions; pre-launch waitlist/marketing; never fill with fake profiles | Owner |
| R-07 | Absence of a religion field reduces adoption (it is a primary criterion for many Bangladeshi families) | Medium | Medium | Kept out per brief; user interviews in first month; documented as OD-026 for phase 2 | Owner |
| R-08 | Photo misuse (screenshots, re-posting) | Medium | High | Photos behind login, optional connections-only visibility, EXIF stripped, no public URLs; honest note that screenshots cannot be prevented on the web | Dev |
| R-09 | Minors registering with a false date of birth | Medium | High | Server-side 18+ check, terms declaration, report reason "appears under 18", immediate suspension runbook | Owner |
| R-10 | Brand name conflict (DUJON already used) | Medium | Medium | Naming clearance checklist before launch | Owner |
| R-11 | Incomplete or misspelt location data (especially city-corporation thanas) | Medium | Low | Vetted dataset, single source file, documented update process | Dev |
| R-12 | Transactional email lands in spam (shared-hosting SMTP) | Medium | Medium | SPF/DKIM/DMARC; option to switch to a transactional email provider | Dev |
| R-13 | Scope creep before launch | Medium | Medium | Change control through `13-open-decisions-and-assumptions.md`; module-by-module build | Owner |

## 9. Assumptions

See `13-open-decisions-and-assumptions.md` for the full list with recommended defaults and impact.
