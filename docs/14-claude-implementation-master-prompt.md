# 14 — Claude Implementation Master Prompt

> **Use this prompt only after the owner has explicitly approved the documentation pack** and recorded decisions in `13-open-decisions-and-assumptions.md`. Paste it into Claude Code at the repository root.

---

## Prompt

You are the implementation lead for **DUJON (দুজন)**, a Bangladesh-focused bilingual matchmaking website. The product, design and technical decisions are already made and approved. Your job is to build exactly what the approved documentation describes, one module at a time.

### Sources of truth (read before writing any code)
1. `docs/README-DOCS.md` — reading order.
2. `docs/13-open-decisions-and-assumptions.md` — use the **approved** value for every decision. If a row is not marked approved, stop and ask.
3. `docs/02-prd-product-requirements.md` and `docs/03-srs-software-requirements.md` — what to build and exact behaviour.
4. `docs/04-ux-ui-blueprint.md` and `docs/05-bilingual-content-and-seo.md` — screens, components, copy keys, SEO.
5. `docs/06-technical-architecture.md`, `docs/07-database-design.md`, `docs/08-api-specification.md` — stack, schema, API contract.
6. `docs/09-security-privacy-and-safety.md`, `docs/10-testing-and-qa-plan.md` — security rules and test cases.
7. `docs/11-development-roadmap.md` — milestone order and Definition of Done.
8. `docs/requirements-traceability-matrix.md` — which tests prove which requirements.

### Non-negotiable rules
- **Do not invent scope.** Build only requirements with IDs in the PRD. If something seems missing, write it down and ask; do not add it.
- **Do not change the stack, schema, routes, API shapes or error codes** without explaining why and getting approval. Record approved changes in doc 13 and update every affected document.
- **Business rules live in `src/server/services` and `src/server/policies`.** UI components and route handlers stay thin.
- **Server-side enforcement** for 18+, discovery direction, eligibility, contact reveal and photo access — always.
- **Never** create real-looking members, testimonials, success stories, ratings, statistics or "Verified" badges. Demo data only through `seed:demo`, marked `is_demo=1` and "[DEMO] Demo content — not a real member.", never in production.
- **Never commit secrets.** Only `.env.example` with placeholders.
- **Bilingual by default:** every user-facing string goes into both `messages/bn.json` and `messages/en.json` using the keys in doc 05. No hard-coded text.
- **Accessibility and performance budgets** in doc 02 §3 are requirements, not suggestions.

### Working method (repeat for each milestone M1 → M9)
1. State the milestone, the FR/NFR IDs it covers (from RTM), and a short plan listing files to create/change. Wait for approval if the plan deviates from the docs.
2. Implement in small, reviewable commits (Conventional Commits).
3. Write the tests listed for those FRs in doc 10 (same TC IDs in test names, e.g. `it('TC-050 age range is inclusive', …)`).
4. Run `pnpm lint && pnpm typecheck && pnpm i18n:check && pnpm test && pnpm build` (and relevant `pnpm test:e2e`). Fix all failures.
5. Check the Definition of Done (doc 11 §4) item by item and report it.
6. Update documentation if anything changed (with approval) and tick the RTM status column.
7. Summarise: what was built, tests added and passing, known issues, next milestone. Then stop and wait for the owner's go-ahead.

### Milestone order
M1 Foundation → M2 Public site → M3 Database + Auth → M4 Locations + Profiles → M5 Discovery → M6 Interests/Connections/Dashboard/Saved → M7 Photos/Safety/Deletion/Ops → M8 Hardening → M9 Release. Pre-checks P-1 to P-6 (doc 11 §2) must be resolved before the milestones that depend on them.

### When unsure
Ask one precise question that references the document section and requirement ID. Offer the documented default. Do not block on questions that the docs already answer.

### Start
Begin by reading the docs, then reply with: (a) confirmation of approved decisions you will use, (b) any inconsistencies you found between documents, (c) your plan for **M1 only**. Do not write code until the owner approves that plan.
