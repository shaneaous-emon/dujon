# MVP Scope Checklist

| Field | Value |
|---|---|
| Product | DUJON (দুজন) |
| Version | 1.0 (draft) |
| Date | 20 November 2026 |

## In scope (MVP)

**Public website**
- [ ] Home (hero, search entry, how it works, why DUJON, honest safety strip, "success stories coming soon", FAQ teaser, CTA)
- [ ] How it works · Safety & privacy · FAQ · Contact (form) · Terms · Privacy Policy · Community Guidelines · 404
- [ ] Bangla default (`/`) + English (`/en`) with persistent switcher

**Accounts**
- [ ] Register: full name, email, optional mobile, password, gender, DOB (server-side 18+), terms consent
- [ ] Login / logout / forgot & reset password
- [ ] Email verification (non-blocking; required for interests by default)
- [ ] Rate limits on auth, contact, interests, reports, uploads

**Profiles**
- [ ] 4-step onboarding with draft saving
- [ ] Shared profile model: display name, managed by, marital status, height, education level + detail, occupation, division/district/upazila-thana, about, family info
- [ ] Publish / hide; preview; gender & DOB read-only
- [ ] Contact info blocked in free text
- [ ] One profile photo with visibility setting (members / connections only), metadata stripped, private storage
- [ ] Partner preferences (age range, optional area)

**Discovery**
- [ ] Opposite-gender discovery for published members
- [ ] Filters: age range, division, district, upazila/thana — nothing else
- [ ] URL-shareable filters, clear filters, pagination (20), empty & cold-start states
- [ ] Profile detail page (404 if not eligible)

**Interactions**
- [ ] Express interest → accept / decline / withdraw; cooldown and daily limit
- [ ] Connections reveal email + mobile to both members only
- [ ] Email notifications (new interest, accepted) with on/off settings
- [ ] Saved profiles

**Safety & account**
- [ ] Block / unblock; report with reasons (+ optional block)
- [ ] Operator CLI scripts (reports, suspend, unsuspend, remove photo, resolve) with audit log
- [ ] Dashboard overview; settings (language, notifications, mobile, password, blocked list, log out everywhere)
- [ ] Account deletion with 30-day purge job

**Platform**
- [ ] SEO for public pages (metadata, OG, canonical, hreflang, sitemap, robots, JSON-LD); member pages noindex
- [ ] MySQL 8 schema + migrations; location dataset seed
- [ ] Automated tests (unit, integration, E2E, a11y, performance, security) per doc 10
- [ ] GitHub repo + CI; Vercel deployment with production MySQL; backups; rollback plan

## Out of scope (MVP)

- [x] SMS OTP · NID / passport / selfie / liveness verification · human identity review
- [x] Any "Verified", "NID Verified", "Authentic Member" badge or "100% genuine" claim
- [x] Chat / messaging, voice or video calling, real-time features
- [x] AI or algorithmic matching, compatibility scores
- [x] Payments, premium plans, coupons
- [x] Admin panel UI (architecture-ready only)
- [x] Religion, complexion, income, body type, blood group, horoscope and other traditional biodata fields/filters
- [x] Multiple photos, photo pre-moderation queue
- [x] Diaspora / international locations, currencies, extra languages
- [x] Native iOS/Android apps (API is ready for later)
- [x] Public or search-indexed member profiles; district/upazila SEO landing pages
- [x] Featured/recent member profiles on public pages
- [x] Testimonials and success stories content (placeholder only; consented content model is future)
- [x] Self-service email change and data export (handled via support)
- [x] Demo data on production

Any change to this list requires an entry in `13-open-decisions-and-assumptions.md` and owner approval.
