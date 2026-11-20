# DUJON (দুজন)

Bangla-first, bilingual matchmaking website for Bangladesh. Next.js + TypeScript + Tailwind CSS, MySQL 8 (from Milestone 3).

**Start here:** [`docs/README-DOCS.md`](docs/README-DOCS.md) — the approved product, design and technical documentation. Build only what it specifies.

## Status

| Milestone                                                      | Status                                             |
| -------------------------------------------------------------- | -------------------------------------------------- |
| M1 Foundation (tooling, design system, Bangla/English routing) | ✅ Done                                            |
| M2 Public site + SEO                                           | Next                                               |
| M3–M9                                                          | Not started — see `docs/11-development-roadmap.md` |

## Requirements

- Node.js 22 LTS (see `.nvmrc`) and pnpm (`corepack enable`)
- Windows, macOS or Linux

## Getting started

```bash
corepack enable
pnpm install
cp .env.example .env.local      # PowerShell: Copy-Item .env.example .env.local
pnpm dev                        # http://localhost:3000  (Bangla)  ·  /en (English)
```

## Scripts

| Command                     | What it does                                                                 |
| --------------------------- | ---------------------------------------------------------------------------- |
| `pnpm dev`                  | Development server                                                           |
| `pnpm build` / `pnpm start` | Production build / serve                                                     |
| `pnpm lint`                 | ESLint (includes the "no hard-coded text" rule)                              |
| `pnpm typecheck`            | Route type generation + TypeScript                                           |
| `pnpm i18n:check`           | Bangla/English message files must match                                      |
| `pnpm test`                 | Unit tests (Vitest)                                                          |
| `pnpm test:e2e`             | Browser tests (Playwright; run `pnpm exec playwright install chromium` once) |
| `pnpm verify`               | Everything above except E2E                                                  |

## Project structure

```text
docs/                 approved documentation (source of truth)
messages/bn.json      Bangla UI text (default)
messages/en.json      English UI text
src/app/[locale]/     pages (Bangla at "/", English at "/en")
src/components/ui/    design-system components
src/components/features/  feature components (e.g. language switcher)
src/config/app.ts     configurable rules (ages, limits) — docs/03 §2
src/i18n/             routing, navigation, message loading
src/proxy.ts          request proxy (locale handling; auth gate from M3)
tests/unit, tests/e2e automated tests (IDs match docs/10)
```

## Rules for contributors

- All user-facing text goes in both `messages/*.json` files — never in components.
- Numbers in messages use ICU `{value, number}` so Bangla shows Bangla digits.
- Business rules belong in `src/server/services` (from M3), never in UI components.
- No fake members, testimonials or "verified" claims — see `docs/09`.
