# Requirements Traceability Matrix (RTM)

| Field | Value |
|---|---|
| Product | DUJON (দুজন) |
| Version | 1.0 (draft) |
| Date | 20 November 2026 |

Status column is updated during implementation: ☐ not started · ◐ in progress · ☑ done (all TCs pass).

Service names refer to `src/server/services/<name>.service.ts` (doc 06 §3.1). Screen IDs: doc 04 §4. APIs: doc 08. Tests: doc 10.

---

## 1. Business requirements → functional requirements

| BR | Covered by |
|---|---|
| BR-001 Adults only | FR-AUTH-001, FR-AUTH-002, FR-PROF-007, FR-DISC-009, FR-SAFE-003 (underage reason) |
| BR-002 Bilingual | FR-I18N-001–006, NFR-I18N-001 |
| BR-003 Opposite-gender discovery by age & location | FR-DISC-001–013, FR-LOC-001–004, FR-PREF-001–003 |
| BR-004 Contact private until mutual agreement | FR-INT-001–010, FR-PROF-008 |
| BR-005 No false verification claims | FR-SAFE-005, FR-PUB-004, FR-PHOTO-007 |
| BR-006 No fabricated content | FR-PUB-008, seed rules (doc 07 §6), TC-117 |
| BR-007 Photo & publication control | FR-PHOTO-003, FR-PROF-003, FR-PROF-004 |
| BR-008 Block & report | FR-SAFE-001–004, 006, 007 |
| BR-009 Account deletion | FR-ACC-005 |
| BR-010 Public SEO, private members | FR-SEO-001–008 |
| BR-011 MySQL + GitHub + Vercel | Doc 06 §1, §7; doc 12; NFR-MAINT-001 |
| BR-012 Future admin & mobile | NFR-MAINT-002; doc 06 §11; doc 08 (versioned API) |
| BR-013 Affordable MVP | Doc 06 §1 (no paid verification/SMS/AI); OD-012, OD-013, OD-023 |
| BR-014 Contact operator | FR-PUB-006 |
| BR-015 Legal pages & consent | FR-PUB-007, FR-AUTH-005 |

## 2. Functional requirements

| Requirement | Screens | Module / service | DB entities | APIs | Test cases | Status |
|---|---|---|---|---|---|---|
| FR-PUB-001 | SCR-01 | PUB (static page) | — | — | TC-001 | ☐ |
| FR-PUB-002 | SCR-01, SCR-09, SCR-18 | PUB, auth, discovery | divisions, districts, upazilas | API-009–011, API-021 | TC-002 | ☐ |
| FR-PUB-003 | SCR-02 | PUB | — | — | TC-003 | ☐ |
| FR-PUB-004 | SCR-03 | PUB | — | — | TC-004 | ☐ |
| FR-PUB-005 | SCR-04 | PUB | — | — | TC-005 | ☐ |
| FR-PUB-006 | SCR-05 | contact | contact_messages, rate_limits | API-041 | TC-006, TC-007 | ☐ |
| FR-PUB-007 | SCR-06, SCR-07, SCR-08 | PUB | users (consent versions) | — | TC-008 | ☐ |
| FR-PUB-008 | SCR-01 | PUB, seed scripts | users.is_demo | — | TC-009, TC-117 | ☐ |
| FR-PUB-009 | All | layout | — | API-004 | TC-010 | ☐ |
| FR-PUB-010 | SCR-28 | layout | — | — | TC-011 | ◐ |
| FR-I18N-001 | All | i18n routing | — | — | TC-012 | ☑ |
| FR-I18N-002 | All | i18n (LanguageSwitcher) | — | — | TC-013 | ☑ |
| FR-I18N-003 | All, SCR-25 | i18n, account | users.preferred_locale | API-037 | TC-014 | ◐ |
| FR-I18N-004 | All | i18n tooling | — | — | TC-015 | ☑ |
| FR-I18N-005 | All | i18n formatting | — | — | TC-016 | ☑ |
| FR-I18N-006 | Emails | mailer | users.preferred_locale | — | TC-017 | ☐ |
| FR-AUTH-001 | SCR-09 | auth | users, profiles, partner_preferences | API-001 | TC-018 | ☐ |
| FR-AUTH-002 | SCR-09 | auth (age lib) | users, profiles | API-001 | TC-019, TC-020 | ☐ |
| FR-AUTH-003 | SCR-09 | auth | users | API-001 | TC-021 | ☐ |
| FR-AUTH-004 | SCR-09, SCR-12, SCR-25 | auth | users | API-001, API-006, API-038 | TC-022 | ☐ |
| FR-AUTH-005 | SCR-09 | auth | users | API-001 | TC-023 | ☐ |
| FR-AUTH-006 | SCR-10 | auth | users, sessions | API-002 | TC-024 | ☐ |
| FR-AUTH-007 | Header menu | auth | sessions | API-003 | TC-025 | ☐ |
| FR-AUTH-008 | — | auth (session lib) | sessions | API-002, API-006, API-038 | TC-026 | ☐ |
| FR-AUTH-009 | SCR-11, SCR-12 | auth | auth_tokens, sessions | API-005, API-006 | TC-027 | ☐ |
| FR-AUTH-010 | SCR-13, SCR-18, SCR-20 | auth | auth_tokens, users | API-007, API-008 | TC-028 | ☐ |
| FR-AUTH-011 | SCR-09–11 | auth, rate limiter | rate_limits | API-001, API-002, API-005, API-008 | TC-029 | ☐ |
| FR-AUTH-012 | Member routes | middleware, auth | sessions | API-004 | TC-030 | ☐ |
| FR-AUTH-013 | SCR-09 → SCR-14 | auth, profile | profiles | API-001 | TC-018 | ☐ |
| FR-PROF-001 | SCR-14–17 | profile | profiles | API-012, API-013 | TC-031 | ☐ |
| FR-PROF-002 | SCR-14, SCR-21 | profile | profiles | API-013 | TC-032 | ☐ |
| FR-PROF-003 | SCR-17, SCR-21 | profile | profiles | API-014 | TC-033 | ☐ |
| FR-PROF-004 | SCR-21 | profile | profiles | API-014 | TC-034 | ☐ |
| FR-PROF-005 | SCR-21 | profile | profiles | API-013 | TC-035 | ☐ |
| FR-PROF-006 | SCR-18, SCR-19 | discovery | profiles, users | API-021, API-022 | TC-036 | ☐ |
| FR-PROF-007 | SCR-21 | profile | profiles | API-013 | TC-037 | ☐ |
| FR-PROF-008 | SCR-14, SCR-21 | profile (text guard) | profiles | API-013 | TC-038 | ☐ |
| FR-PROF-009 | SCR-21, SCR-19 | profile, discovery | profiles | API-022 | TC-039 | ☐ |
| FR-PROF-010 | SCR-14, SCR-18, SCR-19 | profile | profiles | API-013, API-021 | TC-040 | ☐ |
| FR-PREF-001 | SCR-17, SCR-22 | preferences | partner_preferences | API-015, API-016 | TC-041 | ☐ |
| FR-PREF-002 | SCR-17 | preferences | partner_preferences | API-001 | TC-042 | ☐ |
| FR-PREF-003 | SCR-18 | discovery | partner_preferences | API-021 | TC-043 | ☐ |
| FR-LOC-001 | SCR-15 | location, seed | divisions, districts, upazilas | API-009–011 | TC-044 | ☐ |
| FR-LOC-002 | SCR-01, SCR-15, SCR-18, SCR-22 | location (LocationCascade) | divisions, districts, upazilas | API-009–011 | TC-045 | ☐ |
| FR-LOC-003 | SCR-15, SCR-22 | location, profile, preferences | profiles, partner_preferences (composite FKs) | API-013, API-016, API-021 | TC-046 | ☐ |
| FR-LOC-004 | Location UI | location | divisions, districts, upazilas | API-009–011 | TC-047 | ☐ |
| FR-DISC-001 | SCR-18 | discovery | profiles | API-021 | TC-048 | ☐ |
| FR-DISC-002 | SCR-18, SCR-19 | discovery (policy) | profiles | API-021, API-022 | TC-049 | ☐ |
| FR-DISC-003 | SCR-18 | discovery | profiles | API-021 | TC-050 | ☐ |
| FR-DISC-004 | SCR-18 | discovery | — | API-021 | TC-051 | ☐ |
| FR-DISC-005 | SCR-18 | discovery | profiles | API-021 | TC-052 | ☐ |
| FR-DISC-006 | SCR-18 | discovery (UI) | — | API-021 | TC-053 | ☐ |
| FR-DISC-007 | SCR-18 | discovery (UI) | — | API-021 | TC-054 | ☐ |
| FR-DISC-008 | SCR-18 | discovery | profiles | API-021 | TC-055 | ☐ |
| FR-DISC-009 | SCR-18 | discovery (policy) | profiles, users, blocks | API-021 | TC-056, TC-057, TC-058, TC-059 | ☐ |
| FR-DISC-010 | SCR-18 | discovery | profiles, profile_photos, saved_profiles, interests | API-021 | TC-060 | ☐ |
| FR-DISC-011 | SCR-19 | discovery | profiles, users, blocks, interests | API-022 | TC-061 | ☐ |
| FR-DISC-012 | SCR-18 | discovery (UI) | — | API-021 | TC-062 | ☐ |
| FR-DISC-013 | SCR-18 | discovery | profiles | API-021 | TC-063 | ☐ |
| FR-INT-001 | SCR-19, MOD-01 | interest | interests | API-023 | TC-064 | ☐ |
| FR-INT-002 | SCR-19 | interest (policy) | interests, users, blocks, profiles | API-023 | TC-065 | ☐ |
| FR-INT-003 | SCR-19 | interest | interests | API-023 | TC-066 | ☐ |
| FR-INT-004 | SCR-19, SCR-23 | interest | interests | API-025, API-026 | TC-067 | ☐ |
| FR-INT-005 | SCR-19, SCR-23 | interest | interests | API-027 | TC-068 | ☐ |
| FR-INT-006 | SCR-19 | interest | interests | API-023, API-026 | TC-069 | ☐ |
| FR-INT-007 | SCR-19 | interest | interests | API-023 | TC-070 | ☐ |
| FR-INT-008 | SCR-19, SCR-23 | interest (contact policy) | interests, users | API-022, API-028 | TC-071 | ☐ |
| FR-INT-009 | Emails | interest, mailer | users (notify flags) | — | TC-072 | ☐ |
| FR-INT-010 | SCR-23 | interest | interests | API-024, API-028 | TC-073 | ☐ |
| FR-SAVE-001 | SCR-18, SCR-19, SCR-24 | saved | saved_profiles | API-030, API-031 | TC-074 | ☐ |
| FR-SAVE-002 | SCR-24 | saved | saved_profiles, profiles, blocks | API-029 | TC-075 | ☐ |
| FR-SAVE-003 | — | saved | saved_profiles | API-030 | TC-076 | ☐ |
| FR-PHOTO-001 | SCR-16, SCR-21 | photo | profile_photos | API-017 | TC-077 | ☐ |
| FR-PHOTO-002 | SCR-16, SCR-21 | photo (image pipeline, storage) | profile_photos | API-017 | TC-078 | ☐ |
| FR-PHOTO-003 | SCR-16, SCR-21 | photo (policy) | profiles.photo_visibility | API-019, API-020 | TC-079 | ☐ |
| FR-PHOTO-004 | SCR-18, SCR-19, SCR-20 | UI (ProfilePhoto) | — | — | TC-080 | ☐ |
| FR-PHOTO-005 | SCR-18, SCR-19 | photo (policy) | profile_photos | API-020 | TC-081 | ☐ |
| FR-PHOTO-006 | SCR-21 | photo | profile_photos | API-017, API-018 | TC-082 | ☐ |
| FR-PHOTO-007 | SCR-16, SCR-21 | UI copy | — | — | TC-083 | ☐ |
| FR-SAFE-001 | SCR-19, SCR-23, MOD-03 | safety | blocks, interests, saved_profiles | API-033 | TC-084 | ☐ |
| FR-SAFE-002 | SCR-25 | safety | blocks | API-032, API-034 | TC-085 | ☐ |
| FR-SAFE-003 | SCR-19, SCR-23, MOD-02 | safety, mailer | reports | API-035 | TC-086 | ☐ |
| FR-SAFE-004 | SCR-03, SCR-19, SCR-23 | UI (ContactCard) | — | API-022, API-028 | TC-087 | ☐ |
| FR-SAFE-005 | All | copy rules | — | — | TC-088 | ☐ |
| FR-SAFE-006 | MOD-02 | safety | reports, blocks | API-035 | TC-089 | ☐ |
| FR-SAFE-007 | — (CLI) | safety, ops scripts | users, profiles, reports, moderation_actions, sessions, interests, profile_photos | — | TC-090 | ☐ |
| FR-DASH-001 | SCR-20 | dashboard | profiles, users, interests, saved_profiles | API-036 | TC-091 | ☐ |
| FR-DASH-002 | SCR-20–SCR-25 | layout | — | — | TC-092 | ☐ |
| FR-ACC-001 | SCR-25 | account | users, sessions | API-038 | TC-093 | ☐ |
| FR-ACC-002 | SCR-25 | account | users | API-037 | TC-094 | ☐ |
| FR-ACC-003 | SCR-25 | account | users | API-037 | TC-072 | ☐ |
| FR-ACC-004 | SCR-25 | account | users | API-037 | TC-095 | ☐ |
| FR-ACC-005 | SCR-26, SCR-27 | account, purge job | all member tables (doc 07 §7) | API-040, API-042 | TC-096, TC-097 | ☐ |
| FR-ACC-006 | SCR-25 | account | sessions | API-039 | TC-098 | ☐ |
| FR-SEO-001 | SCR-01–08 | SEO metadata | — | — | TC-099 | ☐ |
| FR-SEO-002 | SCR-01–08 | SEO metadata | — | — | TC-100 | ☐ |
| FR-SEO-003 | SCR-01–08 | SEO metadata | — | — | TC-101 | ☐ |
| FR-SEO-004 | — (`/sitemap.xml`) | SEO | — | — | TC-102 | ☐ |
| FR-SEO-005 | — (`/robots.txt`) | SEO | — | — | TC-103 | ☐ |
| FR-SEO-006 | Member/auth screens, API | middleware | — | All API | TC-104 | ☐ |
| FR-SEO-007 | SCR-01, SCR-04 | SEO | — | — | TC-105 | ☐ |
| FR-SEO-008 | SCR-01–08 | layout | — | — | TC-106 | ☐ |

## 3. Non-functional requirements

| NFR | Verified by | Status |
|---|---|---|
| NFR-PERF-001 | TC-107, Speed Insights | ☐ |
| NFR-PERF-002 | TC-108 | ☐ |
| NFR-PERF-003 | TC-107 | ☐ |
| NFR-PERF-004 | TC-107 | ☐ |
| NFR-A11Y-001 | TC-109 | ☐ |
| NFR-A11Y-002 | TC-110 | ☐ |
| NFR-A11Y-003 | TC-110 | ☐ |
| NFR-SEC-001 | TC-112, TC-113, TC-114, doc 09 §13 | ☐ |
| NFR-PRIV-001 | Schema review (doc 07), TC-036 | ☐ |
| NFR-I18N-001 | TC-015, Bangla editor sign-off | ☐ |
| NFR-RESP-001 | TC-111 | ☐ |
| NFR-COMP-001 | TC-118 | ☐ |
| NFR-REL-001 | TC-116 | ☐ |
| NFR-REL-002 | Uptime monitor (post-launch) | ☐ |
| NFR-MAINT-001 | CI pipeline | ☐ |
| NFR-MAINT-002 | Code review checklist (doc 11 §4) | ☐ |
| NFR-OBS-001 | TC-115 | ☐ |

## 4. Coverage check

- Every FR (102) maps to at least one screen or explicit "no screen" entry, a module, and at least one test case.
- Every API (API-001 – API-042) maps to at least one FR (doc 08 §3).
- Every MVP table maps to at least one FR: users, sessions, auth_tokens, profiles, profile_photos, divisions, districts, upazilas, partner_preferences, interests, saved_profiles, blocks, reports, moderation_actions, contact_messages, rate_limits.
- Every screen (SCR-01 – SCR-28, MOD-01 – MOD-04) maps to requirements in doc 04 §4.
