# DUJON (দুজন) — Documentation Pack

| Field | Value |
|---|---|
| Version | 1.0 (draft for owner review) |
| Date | 20 November 2026 |
| Source brief | `DUJON_Master_Product_Brief_and_Claude_Documentation_Prompt.md` v1.0 |
| Status | **Approved by owner on 2026-11-20. Implementation in progress (M1).** |

## What this pack is

A complete, cross-referenced blueprint for the DUJON MVP: a Bangla-first, bilingual Bangladeshi matchmaking website built with Next.js, TypeScript and MySQL, deployable from GitHub to Vercel. Every requirement has an ID and acceptance criteria, and the traceability matrix connects requirements to screens, services, database tables, APIs and test cases.

## Reading order

| # | File | Read it for | Primary audience |
|---|---|---|---|
| 1 | `00-product-overview.md` | Vision, scope, key rules, naming checklist | Everyone |
| 2 | `13-open-decisions-and-assumptions.md` | **Decisions the owner must approve** + contradictions found in the brief | Owner (first action) |
| 3 | `mvp-scope-checklist.md` | One-page in/out of scope | Owner, developer |
| 4 | `01-brd-business-requirements.md` | Objectives, stakeholders, business rules, metrics, risk register | Owner |
| 5 | `02-prd-product-requirements.md` | User stories, functional requirements (FR-*), acceptance criteria, NFRs | Owner, developer, QA |
| 6 | `03-srs-software-requirements.md` | Exact system behaviour, validation, states, error codes, edge cases | Developer, QA |
| 7 | `04-ux-ui-blueprint.md` | Sitemap, journeys, screens, wireframes, design system, image inventory | Designer, developer |
| 8 | `05-bilingual-content-and-seo.md` | Bangla/English copy sheet, translation keys, SEO plan | Content editor, developer |
| 9 | `06-technical-architecture.md` | Stack rationale, diagrams, modules, MySQL-on-Vercel approach | Developer |
| 10 | `07-database-design.md` | ERD, tables, indexes, data dictionary, seed and retention rules | Developer |
| 11 | `08-api-specification.md` | REST endpoints, examples, errors, pagination | Developer, future mobile team |
| 12 | `09-security-privacy-and-safety.md` | Threats, controls, 18+, reporting runbook, legal checklist | Owner, developer, lawyer |
| 13 | `10-testing-and-qa-plan.md` | Test strategy and 118 test cases | QA, developer |
| 14 | `11-development-roadmap.md` | Pre-checks, milestones, Definition of Done | Owner, developer |
| 15 | `12-local-setup-github-vercel-deployment.md` | Local setup, env vars, GitHub, Vercel, backups, rollback | Developer |
| 16 | `requirements-traceability-matrix.md` | Requirement ↔ screen ↔ service ↔ table ↔ API ↔ test | Everyone |
| 17 | `14-claude-implementation-master-prompt.md` | Prompt to start building after approval | Owner → Claude Code |

## ID conventions

| Prefix | Meaning | Defined in |
|---|---|---|
| BO-, BR-, BRL-, SM-, R- | Business objectives, requirements, rules, success metrics, risks | 01 |
| US- | User stories | 02 |
| FR-<MODULE>-NNN | Functional requirements (modules: PUB, I18N, AUTH, PROF, PREF, LOC, DISC, INT, SAVE, PHOTO, SAFE, DASH, ACC, SEO) | 02 / 03 |
| NFR-<CAT>-NNN | Non-functional requirements | 02 |
| SCR-, MOD-, IMG- | Screens, modal dialogs, images | 04 |
| API-NNN | API endpoints | 08 |
| TC-NNN | Test cases | 10 |
| OD-, AS-, C- | Open decisions, assumptions, contradictions | 13 |
| L- | Legal checklist items | 09 |
| P-, M | Pre-implementation checks, milestones | 11 |

## Labels

**[CONFIRMED]** stated in the brief · **[ASSUMPTION]** recommended default recorded in doc 13 · **[OPEN]** needs owner decision · **[FUTURE]** not in MVP.

## Honesty rules applied throughout

- No real or invented members, couples, testimonials, ratings or statistics appear anywhere in this pack. API examples use obviously illustrative values.
- No verification badge or genuineness claim is specified; the product states openly that identity is not verified in this version.
- Legal content is an outline for a qualified Bangladesh lawyer, not legal advice.
- Availability of the name, domain or handles is not claimed.

## How to approve

1. Review `13-open-decisions-and-assumptions.md`; tick or change each decision and answer the four essential questions (§4).
2. Skim `mvp-scope-checklist.md` and confirm scope.
3. Reply with explicit approval (e.g. "Docs approved — start M1").
4. Claude then follows `14-claude-implementation-master-prompt.md`.
