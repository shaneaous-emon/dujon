# 00 — Product Overview

| Field | Value |
|---|---|
| Product | DUJON (দুজন) — working brand name |
| Document | Product overview |
| Version | 1.0 (draft for owner review) |
| Date | 20 November 2026 |
| Status | **Awaiting owner approval. Implementation has not started.** |
| Source of truth | `DUJON_Master_Product_Brief_and_Claude_Documentation_Prompt.md` v1.0 |

> Labels used across all documents:
> **[CONFIRMED]** = stated in the master brief. **[ASSUMPTION]** = recommended default, recorded so work can continue and listed in `13-open-decisions-and-assumptions.md`. **[OPEN]** = needs owner decision. **[FUTURE]** = explicitly not in MVP.

---

## 1. Product vision

DUJON is a modern, trustworthy, bilingual (Bangla-first) matchmaking website for adults in Bangladesh who are looking for a life partner. It should feel like a respectfully run, professional service: simple to use, honest about what it does and does not verify, and protective of members' privacy.

**Promise [CONFIRMED]:** “সহজে খুঁজুন আপনার মনের মতো জীবনসঙ্গী।” / “Find someone who feels right.”

**Brand values [CONFIRMED]:** trust, simplicity, respect, privacy, real people, modern and approachable design.

## 2. Problem statement

People in Bangladesh who look for a spouse online commonly face:

1. **Outdated, cluttered interfaces.** Many existing matrimony sites use long biodata forms, dense directory layouts and desktop-first design that is hard to use on a phone.
2. **Low trust.** Fake profiles, recycled photos and scam posts (especially in Facebook "পাত্র-পাত্রী চাই" groups) make users cautious.
3. **Privacy anxiety.** Phone numbers and photos are often exposed too early; women in particular worry about misuse.
4. **Overwhelming search.** Dozens of filters and long biodata fields slow people down without helping them find a suitable match.

DUJON's MVP responds with: a clean mobile-first experience, a small number of useful filters (age and location), mutual-interest before contact details are shared, photo privacy controls, reporting/blocking, and honest communication that identity verification is not yet available.

## 3. Target audience

| Segment | Description | MVP treatment |
|---|---|---|
| Primary | Adults (18+) in Bangladesh seeking marriage, managing their own profile | Full product |
| Secondary | Parent/guardian managing a profile for their adult son/daughter | Supported through a single account with a "Profile managed by" field **[ASSUMPTION]** |
| Excluded | Anyone under 18 | Blocked at registration (server-enforced) **[CONFIRMED]** |
| Excluded (MVP) | Diaspora / international users as a designed segment | Not designed for; architecture remains extensible **[CONFIRMED]** |

Digital literacy varies widely, so every flow must work for a first-time smartphone user: short forms, plain Bangla, large touch targets, and clear error messages.

## 4. Value proposition

| For members | DUJON offers |
|---|---|
| Simplicity | Register in about two minutes; a step-by-step profile set-up instead of a long biodata form |
| Relevant discovery | Search by age range and Division → District → Upazila/Thana |
| Privacy by default | Contact details only shared after mutual interest; photo visibility controls; profiles never shown to logged-out visitors or search engines |
| Safety | Block, report, safety guidance, and honest messaging about verification |
| Language | Genuinely bilingual — Bangla by default, English available everywhere |

## 5. Market scope

- **MVP market: Bangladesh only [CONFIRMED].**
- Location model: Division → District → Upazila/Thana (with city-corporation thanas supported, see `07-database-design.md` §4).
- Currency, international locations and extra languages are **[FUTURE]**; the architecture keeps locale, location and configuration separate from business logic so these can be added later.

## 6. MVP boundaries (summary)

### In scope
Public website (home, how it works, safety, FAQ, contact, legal pages, success-stories placeholder) · Bangla/English switching · email + password registration with 18+ enforcement · login/logout/password reset · one shared profile model · partner preferences · one profile photo with privacy setting · discovery with four filters (age range, division, district, upazila/thana) · profile detail page · Express Interest → accept/decline → connection with contact reveal · saved profiles · block and report · dashboard · account settings and account deletion · SEO for public pages · automated tests · local setup and Vercel deployment.

### Out of scope (MVP)
SMS OTP · NID/passport/selfie verification · any "Verified" badge · chat, voice or video calling · AI matching · payments or premium plans · admin panel UI · religion and other traditional biodata filters · diaspora features · native mobile apps · public/indexed member profiles · fabricated testimonials or demo members in production.

Full list: `mvp-scope-checklist.md`.

## 7. Key product rules (one-page view)

1. Nobody under 18 can register, publish, search or be matched — enforced on the server.
2. A male member discovers female profiles; a female member discovers male profiles. Discovery logic lives in one server-side function.
3. Only **published** profiles of **active** accounts appear in discovery; own profile, blocked users (both directions) and suspended/deleted accounts never appear.
4. Contact details (account email and optional mobile) are shown only to the two members of an accepted connection.
5. Photos are never visible to logged-out visitors or search engines.
6. No "Verified" badge or claim of genuineness anywhere.
7. No fabricated people, testimonials, statistics or success stories. Demo data is clearly labelled and never deployed to production.

## 8. Assumptions and open decisions (summary)

The full register with recommended defaults and impact is in `13-open-decisions-and-assumptions.md`. The most important ones:

| ID | Decision | Recommended default |
|---|---|---|
| OD-001 | Registration identifier | Email **required** (login + password reset); mobile **optional**, private, shown only to connections |
| OD-002 | Email verification | Verification email sent; login works without it; **verified email required to send/accept interests** (configurable) |
| OD-003 | Can logged-out visitors browse profiles? | **No.** Homepage search form leads to register/login with filters preserved |
| OD-004 | What is revealed on mutual interest | Account email + mobile (if provided) of both members |
| OD-005 | Default photo visibility | "Logged-in members who can discover me", with "Only my connections" option |
| OD-014 | Hosting | Vercel (Pro plan, commercial use) + owner's MySQL 8 server, subject to remote-access and connection-limit checks |
| OD-023 | Monetisation | Free in MVP; no payments |
| OD-026 | Religion field | Not collected in MVP (per brief), flagged as a likely user demand to re-evaluate |

## 9. Naming clearance checklist (DUJON)

The name is a **working brand name only**. Nothing in this pack claims availability. Before public launch, complete:

- [ ] Domain availability: `dujon.com`, `dujon.com.bd`, `dujon.app`, `dujonbd.com` (and Bangla IDN if desired)
- [ ] Social handles: Facebook page, Instagram, TikTok, YouTube, LinkedIn, X
- [ ] Bangladesh trademark search (Department of Patents, Designs and Trademarks — DPDT) in relevant classes (e.g. 45 — dating/matchmaking services; 9 — software; 42 — online platforms)
- [ ] App-store name check (Google Play, Apple App Store) for future apps
- [ ] Search for existing businesses called "Dujon/দুজন" in Bangladesh (e-commerce, events, wedding services) to avoid confusion
- [ ] Bangla spelling and English transliteration fixed in brand guide (দুজন / DUJON)
- [ ] Owner sign-off; record results in `13-open-decisions-and-assumptions.md` (OD-018)

## 10. Document map

See `README-DOCS.md` for reading order and the full file list.
