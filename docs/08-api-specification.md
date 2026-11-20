# 08 — API Specification (`/api/v1`)

| Field | Value |
|---|---|
| Product | DUJON (দুজন) |
| Version | 1.0 (draft) |
| Date | 20 November 2026 |
| Status | Awaiting owner approval |

The REST API is implemented with Next.js Route Handlers. Each handler is a thin wrapper over the service layer (doc 06 §3). The web UI may call the same services directly through Server Components / Server Actions; behaviour and error codes are identical. The API is the contract for the future mobile app.

---

## 1. Conventions

| Topic | Rule |
|---|---|
| Base path | `/api/v1` |
| Format | JSON (`application/json; charset=utf-8`); photo upload uses `multipart/form-data` |
| Auth | Cookie `dujon_session` (web). Future mobile: `Authorization: Bearer <token>` against the same `sessions` table |
| Locale | `Accept-Language: bn` or `en` (falls back to user preference, then `bn`) — affects `message` text only; `code` values are stable |
| IDs | Profiles referenced by `publicId` (12 chars); photos by photo `publicId`; interests/reports by numeric `id` only to their participants |
| Dates | ISO 8601 UTC (`2026-11-20T10:15:00.000Z`); DOB `YYYY-MM-DD` |
| CSRF | Mutating requests must have same-origin `Origin` header (web) |
| Headers on all responses | `Cache-Control: private, no-store` (unless noted), `X-Robots-Tag: noindex, nofollow`, `X-Request-Id` |
| Rate limiting | `429` with `Retry-After` header and `error.retryAfter` (seconds) |
| Versioning | Breaking changes → `/api/v2`; additive fields allowed in v1 |

## 2. Error format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "এই তথ্যটি দিতে হবে।",
    "fields": { "occupation": "REQUIRED" },
    "requestId": "req_01JD3K…"
  }
}
```

Codes and HTTP statuses: `03-srs-software-requirements.md` §6. Field-level codes: `REQUIRED`, `TOO_SHORT`, `TOO_LONG`, `INVALID_FORMAT`, `OUT_OF_RANGE`, `CONTACT_INFO_NOT_ALLOWED`, `NOT_ALLOWED_VALUE`.

## 3. Endpoint list

Auth column: **P** public · **G** guest-only (redirect/409 if logged in) · **M** any logged-in active member · **MP** member with published profile · **MV** published + verified email (when configured) · **I** internal (cron secret).

| ID | Method & path | Auth | Module | Purpose | FRs |
|---|---|---|---|---|---|
| API-001 | `POST /auth/register` | G | AUTH | Create account + session | FR-AUTH-001–005, 013 |
| API-002 | `POST /auth/login` | G | AUTH | Log in | FR-AUTH-006, 011 |
| API-003 | `POST /auth/logout` | M | AUTH | End current session | FR-AUTH-007 |
| API-004 | `GET /auth/session` | P | AUTH | Current user summary or `null` | FR-AUTH-012 |
| API-005 | `POST /auth/password/forgot` | P | AUTH | Request reset email | FR-AUTH-009 |
| API-006 | `POST /auth/password/reset` | P | AUTH | Reset with token | FR-AUTH-009 |
| API-007 | `POST /auth/email/verify` | P | AUTH | Verify email with token | FR-AUTH-010 |
| API-008 | `POST /auth/email/resend` | M | AUTH | Resend verification | FR-AUTH-010 |
| API-009 | `GET /locations/divisions` | P | LOC | List divisions | FR-LOC-001, 004 |
| API-010 | `GET /locations/divisions/{id}/districts` | P | LOC | Districts of a division | FR-LOC-002 |
| API-011 | `GET /locations/districts/{id}/upazilas` | P | LOC | Upazilas/thanas of a district | FR-LOC-002 |
| API-012 | `GET /me/profile` | M | PROF | Own full profile | FR-PROF-005, 009 |
| API-013 | `PATCH /me/profile` | M | PROF | Update profile fields | FR-PROF-001, 002, 005, 007, 008, 010, FR-LOC-003 |
| API-014 | `PUT /me/profile/status` | M | PROF | Publish or hide | FR-PROF-003, 004 |
| API-015 | `GET /me/preferences` | M | PREF | Get preferences | FR-PREF-001 |
| API-016 | `PUT /me/preferences` | M | PREF | Save preferences | FR-PREF-001 |
| API-017 | `POST /me/photo` | M | PHOTO | Upload/replace photo | FR-PHOTO-001, 002, 006 |
| API-018 | `DELETE /me/photo` | M | PHOTO | Delete photo | FR-PHOTO-006 |
| API-019 | `PATCH /me/photo/visibility` | M | PHOTO | Set visibility | FR-PHOTO-003 |
| API-020 | `GET /photos/{photoPublicId}/{size}` | M | PHOTO | Authorised image bytes | FR-PHOTO-005 |
| API-021 | `GET /profiles` | MP | DISC | Search | FR-DISC-001–010, 013, FR-PREF-003 |
| API-022 | `GET /profiles/{publicId}` | MP* | DISC | Profile detail | FR-DISC-011, FR-INT-008 |
| API-023 | `POST /interests` | MV | INT | Send interest | FR-INT-001–003, 006, 007 |
| API-024 | `GET /interests?box=received\|sent` | M | INT | List interests | FR-INT-010 |
| API-025 | `POST /interests/{id}/accept` | MV | INT | Accept | FR-INT-004, 008 |
| API-026 | `POST /interests/{id}/decline` | M | INT | Decline | FR-INT-004, 006 |
| API-027 | `POST /interests/{id}/withdraw` | M | INT | Withdraw | FR-INT-005 |
| API-028 | `GET /connections` | M | INT | Accepted connections with contact details | FR-INT-008, 010 |
| API-029 | `GET /me/saved` | MP | SAVE | Saved profiles | FR-SAVE-002 |
| API-030 | `PUT /me/saved/{publicId}` | MP | SAVE | Save (idempotent) | FR-SAVE-001, 003 |
| API-031 | `DELETE /me/saved/{publicId}` | MP | SAVE | Unsave | FR-SAVE-001 |
| API-032 | `GET /me/blocks` | M | SAFE | Blocked list | FR-SAFE-002 |
| API-033 | `PUT /me/blocks/{publicId}` | M | SAFE | Block (idempotent) | FR-SAFE-001 |
| API-034 | `DELETE /me/blocks/{publicId}` | M | SAFE | Unblock | FR-SAFE-002 |
| API-035 | `POST /reports` | M | SAFE | Report a member | FR-SAFE-003, 006 |
| API-036 | `GET /me/dashboard` | M | DASH | Overview counts and checklist | FR-DASH-001 |
| API-037 | `PATCH /me/account` | M | ACC | Locale, notifications, mobile | FR-ACC-002–004, FR-I18N-003 |
| API-038 | `POST /me/account/password` | M | ACC | Change password | FR-ACC-001 |
| API-039 | `POST /me/account/logout-all` | M | ACC | Revoke all sessions | FR-ACC-006 |
| API-040 | `POST /me/account/delete` | M | ACC | Delete account | FR-ACC-005 |
| API-041 | `POST /contact` | P | PUB | Contact form | FR-PUB-006 |
| API-042 | `GET /api/internal/cron/purge` | I | ACC | Daily purge job (not under `/v1`; Vercel Cron calls with GET) | FR-ACC-005 |

\* API-022 also allows connected members to view each other (doc 03 §4.5).

## 4. Endpoint details

### API-001 `POST /auth/register`
Request:
```json
{ "fullName": "Rahima Akter", "email": "rahima@example.com", "mobile": "01712345678",
  "password": "********", "gender": "female", "dateOfBirth": "1998-04-12",
  "acceptTerms": true, "locale": "bn", "website": "" }
```
`201`:
```json
{ "status": "check_email", "next": "/onboarding" }
```
For an already-registered email the response is identical in shape (`status: "check_email"`) but no session cookie is set and `next` is `/login` — the UI shows the same "check your email" message in both cases (FR-AUTH-003).
Errors: `VALIDATION_ERROR`, `UNDER_AGE`, `INVALID_DATE`, `RATE_LIMITED`.

### API-002 `POST /auth/login`
`{ "email": "…", "password": "…", "next": "/search" }` → `200 { "next": "/search" }` + `Set-Cookie`. Errors: `INVALID_CREDENTIALS` (401), `RATE_LIMITED`.

### API-004 `GET /auth/session`
`200 { "user": { "locale": "bn", "emailVerified": false, "profile": { "publicId": "k3m9q2x7a1bc", "displayName": "Rahima", "status": "draft", "onboardingStep": 2 } } }` or `{ "user": null }`. Never returns email/mobile/full name (not needed by UI shell).

### API-005 / API-006 Password reset
`POST /auth/password/forgot { "email": "…" }` → always `202 { "status": "sent_if_exists" }`.
`POST /auth/password/reset { "token": "…", "password": "…" }` → `200 { "next": "/dashboard" }`; errors `TOKEN_INVALID_OR_EXPIRED`, `VALIDATION_ERROR`.

### API-007 / API-008 Email verification
`POST /auth/email/verify { "token": "…" }` → `200 { "status": "verified" }` or `TOKEN_INVALID_OR_EXPIRED`. `POST /auth/email/resend` → `202`; `RATE_LIMITED`.

### API-009–011 Locations
`GET /locations/divisions/3/districts` →
```json
{ "items": [ { "id": 26, "nameBn": "গাজীপুর", "nameEn": "Gazipur" } ] }
```
Upazilas include `"type": "upazila" | "thana"`. Sorted by current locale. `Cache-Control: public, s-maxage=86400`. Unknown parent → `404`.

### API-012 / API-013 Own profile
`GET /me/profile` → full own profile including `dateOfBirth`, `age`, `status`, `onboardingStep`, `missingForPublish: ["about"]`, `photo`, `photoVisibility`.
`PATCH /me/profile` (partial):
```json
{ "displayName": "Rahima", "createdBy": "self", "maritalStatus": "never_married",
  "heightCm": 160, "educationLevel": "bachelors", "educationDetail": "BBA",
  "occupation": "Bank officer", "divisionId": 3, "districtId": 26, "upazilaId": 412,
  "about": "…", "familyInfo": "…", "onboardingStep": 2 }
```
`200` returns updated profile. Errors: `VALIDATION_ERROR`, `CONTACT_INFO_NOT_ALLOWED`, `LOCATION_MISMATCH`, `FIELD_NOT_EDITABLE` (if `gender`/`dateOfBirth` sent), `PROFILE_INCOMPLETE` (clearing a required field while published).

### API-014 `PUT /me/profile/status`
`{ "status": "published" | "hidden" }` → `200 { "status": "published", "publishedAt": "…" }`. Errors: `PROFILE_INCOMPLETE` with `"missing": ["about","upazilaId"]`; `FORBIDDEN` if suspended.

### API-015 / API-016 Preferences
`PUT /me/preferences { "ageMin": 26, "ageMax": 32, "divisionId": 3, "districtId": null, "upazilaId": null }` → `200`. Errors: `INVALID_AGE_RANGE`, `LOCATION_MISMATCH`.

### API-017 `POST /me/photo`
`multipart/form-data`: `file` (binary), `visibility` (optional). → `201 { "photo": { "publicId": "p_7hd…", "width": 800, "height": 1000 } }`. Errors: `FILE_TOO_LARGE` (413), `INVALID_IMAGE`, `IMAGE_TOO_SMALL`, `RATE_LIMITED`.

### API-018 / API-019
`DELETE /me/photo` → `204`. `PATCH /me/photo/visibility { "visibility": "connections" }` → `200`.

### API-020 `GET /photos/{photoPublicId}/{size}`
`size` = `full` | `thumb`. `200 image/webp` (or `302` to 60-second presigned URL). Headers: `Cache-Control: private, max-age=300`. Not permitted or not found → `404` (identical).

### API-021 `GET /profiles` — search
Query: `age_min`, `age_max`, `division`, `district`, `upazila`, `page`, `reset`.
```http
GET /api/v1/profiles?age_min=25&age_max=30&district=26&page=1
```
`200`:
```json
{
  "filters": { "ageMin": 25, "ageMax": 30, "divisionId": 3, "districtId": 26, "upazilaId": null, "source": "query" },
  "page": 1, "pageSize": 20, "total": 37, "totalPages": 2,
  "items": [
    { "publicId": "k3m9q2x7a1bc", "displayName": "Demo Name", "age": 27,
      "district": { "id": 26, "name": "গাজীপুর" }, "division": { "id": 3, "name": "ঢাকা" },
      "occupation": "Teacher", "educationLevel": "masters", "maritalStatus": "never_married",
      "createdBy": "parent",
      "photo": { "thumbUrl": "/api/v1/photos/p_7hd…/thumb" },
      "isSaved": false, "interestStatus": "none" }
  ]
}
```
*(Example values are illustrative only.)* `photo` is `null` when none or not permitted. `filters.source` = `query` | `preferences` | `reset`.
Errors: `INVALID_AGE_RANGE`, `LOCATION_MISMATCH`, `PROFILE_NOT_PUBLISHED` (403), `RATE_LIMITED`.

### API-022 `GET /profiles/{publicId}`
`200` returns card fields plus `heightCm`, `educationDetail`, `upazila`, `about`, `familyInfo`, `lookingFor { ageMin, ageMax, area }`, `interest { id, direction: "sent"|"received", status, canResendAfter }`, `isBlockedByMe:false`, and **only for connected pairs** `contact { email, mobile }`. Own profile returns `preview: true`. Not visible → `404 PROFILE_NOT_AVAILABLE`.

### API-023 `POST /interests`
`{ "toPublicId": "k3m9q2x7a1bc" }` → `201 { "interest": { "id": 912, "status": "pending", "createdAt": "…" } }`.
Errors: `PROFILE_NOT_PUBLISHED`, `EMAIL_NOT_VERIFIED`, `PROFILE_NOT_AVAILABLE` (404), `INTEREST_EXISTS`, `REVERSE_INTEREST_PENDING` (includes `interestId` to accept), `ALREADY_CONNECTED`, `INTEREST_COOLDOWN` (includes `retryAfterDate`), `INTEREST_DAILY_LIMIT`.

### API-024 `GET /interests?box=received|sent&page=`
Items: `{ id, status, createdAt, respondedAt, counterpart: { card fields }, counterpartHidden: false }`. Received box orders `pending` first, then newest.

### API-025–027 Respond
`POST /interests/{id}/accept|decline|withdraw` → `200 { "interest": { "id": 912, "status": "accepted" } }`. Errors: `NOT_FOUND` (not a participant), `FORBIDDEN` (wrong role, e.g. sender accepting), `INTEREST_NOT_PENDING` (409), `EMAIL_NOT_VERIFIED` (accept), `PROFILE_NOT_AVAILABLE` (counterpart hidden/blocked/deleted).

### API-028 `GET /connections`
Items: `{ interestId, connectedAt, counterpart: { card fields }, contact: { email, mobile|null } }`. Excludes pairs with blocks or non-active accounts.

### API-029–031 Saved
`GET /me/saved?page=` (card list, eligibility re-applied) · `PUT /me/saved/{publicId}` → `204` · `DELETE …` → `204`. Saving an ineligible profile → `404`.

### API-032–034 Blocks
`GET /me/blocks` → `{ items: [{ publicId, displayName, blockedAt }] }` (minimal data) · `PUT /me/blocks/{publicId}` → `204` · `DELETE …` → `204`. Block works on any existing member the actor has interacted with or can discover; otherwise `404`.

### API-035 `POST /reports`
`{ "reportedPublicId": "k3m9q2x7a1bc", "reason": "money_request_or_scam", "details": "…", "alsoBlock": true }` → `201 { "reportId": 55 }`. Errors: `REPORT_EXISTS`, `VALIDATION_ERROR`, `RATE_LIMITED`, `NOT_FOUND`.

### API-036 `GET /me/dashboard`
`{ "profileStatus": "published", "checklist": { "basics": true, "location": true, "photo": false, "preferences": true, "emailVerified": false }, "counts": { "pendingReceived": 2, "connections": 1, "saved": 5 } }`

### API-037 `PATCH /me/account`
`{ "locale": "en", "notifyInterestReceived": false, "notifyInterestAccepted": true, "mobile": "01812345678" | null }` → `200`.

### API-038 `POST /me/account/password`
`{ "currentPassword": "…", "newPassword": "…" }` → `200`; other sessions revoked. Errors: `INVALID_CREDENTIALS`, `VALIDATION_ERROR`, `RATE_LIMITED`.

### API-039 `POST /me/account/logout-all` → `204` (current session also ended).

### API-040 `POST /me/account/delete`
`{ "password": "…", "confirmation": "DELETE" | "মুছে ফেলুন" }` → `202 { "status": "pending_deletion", "purgeAfter": "2026-12-20" }`; cookie cleared.

### API-041 `POST /contact`
`{ "name": "…", "email": "…", "mobile": null, "subject": "account_help", "message": "…", "website": "" }` → `201`. Errors: `VALIDATION_ERROR`, `RATE_LIMITED`. Honeypot filled → `201` but nothing stored (silent drop).

### API-042 `GET /api/internal/cron/purge`
Header `Authorization: Bearer ${CRON_SECRET}` (Vercel Cron sends it automatically when `CRON_SECRET` is set). GET is used because Vercel Cron invokes paths with GET; the handler rejects requests without the secret (401) and is safe to run repeatedly. Idempotent; processes in batches of 100 users; returns `{ "purgedUsers": 3, "deletedSessions": 120, … }`. Logs counts only.

## 5. Pagination and filtering

- Offset pagination: `page` (1-based), fixed `pageSize` 20, response has `total` and `totalPages`; `page > SEARCH_MAX_PAGE (50)` → `400 VALIDATION_ERROR`.
- Filtering only by documented parameters; unknown parameters ignored.
- Stable sort `published_at DESC, id DESC` (search), `created_at DESC, id DESC` (lists).
- **Upgrade path:** cursor pagination `?cursor=<base64(published_at,id)>` can be added in v1 as an alternative param without breaking clients.

## 6. Permission rules summary

Every endpoint calls `getActor()` (except P), then the service enforces ownership/eligibility:
- `/me/*` act only on the actor's own records.
- Anything referencing another member uses `isDiscoverable` or participant checks; failures return `404` to avoid revealing existence.
- Contact details appear only in API-022 (connected pairs) and API-028.
- No endpoint returns `fullName`, `dateOfBirth` of others, `password_hash`, tokens, or internal numeric user IDs.

## 7. Future admin and mobile notes
- Admin endpoints will live under `/api/v1/admin/*` and require `role=admin`; not implemented.
- Mobile login will add `POST /auth/token` returning a bearer token; not implemented in MVP.
