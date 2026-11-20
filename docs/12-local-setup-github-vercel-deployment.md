# 12 — Local Setup, GitHub and Vercel Deployment

| Field | Value |
|---|---|
| Product | DUJON (দুজন) |
| Version | 1.0 (draft) |
| Date | 20 November 2026 |
| Status | Awaiting owner approval — this guide describes the planned setup; the repository does not exist yet |

> No real credentials appear in this document. Replace every `<placeholder>`.

---

## 1. Prerequisites

| Tool | Version | Notes (Windows) |
|---|---|---|
| Node.js | Current LTS supported by Vercel (record exact version in `.nvmrc`) | Install via `nvm-windows` or the official installer |
| pnpm | Latest stable (via `corepack enable`) | Package manager for the project |
| Git | Latest | Git for Windows; set `core.autocrlf=input` |
| Docker Desktop | Latest | Runs local MySQL 8, MinIO (S3-compatible storage) and Mailpit (email catcher). Alternative: install MySQL 8 Community locally |
| MySQL client | 8.x | MySQL Workbench or CLI, optional |
| VS Code / Claude Code | — | Recommended extensions: ESLint, Prettier, Tailwind CSS IntelliSense |

## 2. Local environment

### 2.1 Services (`docker-compose.yml`, planned)

| Service | Image | Port | Purpose |
|---|---|---|---|
| mysql | `mysql:8.4` (LTS line) | 3306 | Local database `dujon_dev` and test database `dujon_test` |
| minio | `minio/minio` | 9000 / 9001 | Local S3-compatible bucket `dujon-photos-dev` |
| mailpit | `axllent/mailpit` | 1025 (SMTP) / 8025 (web UI) | Captures all outgoing email locally |

MySQL container settings: `character-set-server=utf8mb4`, `collation-server=utf8mb4_0900_ai_ci`, `default-time-zone='+00:00'`.

### 2.2 First-time setup

```bash
git clone https://github.com/<owner>/dujon.git
cd dujon
corepack enable
pnpm install
cp .env.example .env.local        # Windows PowerShell: Copy-Item .env.example .env.local
docker compose up -d              # MySQL, MinIO, Mailpit
pnpm db:migrate                   # apply drizzle/ migrations to dujon_dev
pnpm seed:locations               # load Bangladesh location data
pnpm seed:demo                    # OPTIONAL — clearly labelled demo members, dev only
pnpm dev                          # http://localhost:3000
```

### 2.3 Everyday commands (planned `package.json` scripts)

| Command | Purpose |
|---|---|
| `pnpm dev` | Run locally |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Vitest unit + integration (uses `dujon_test`) |
| `pnpm test:e2e` | Playwright E2E (starts app against test DB) |
| `pnpm build` | Production build |
| `pnpm i18n:check` | Message key parity |
| `pnpm db:generate` | Generate SQL migration from schema changes |
| `pnpm db:migrate` | Apply migrations to the DB in `MIGRATION_DATABASE_URL` |
| `pnpm seed:locations` | Upsert location data |
| `pnpm seed:demo` / `pnpm seed:demo --purge` | Add/remove demo data (refuses in production) |
| `pnpm ops:<script>` | Operator scripts (doc 03 §4.9) |

## 3. MySQL setup

### 3.1 Facts to collect from the owner's server (pre-check P-1)

| Item | Value |
|---|---|
| Hosting provider / plan | `<…>` |
| MySQL version (`SELECT VERSION();`) | `<must be 8.0.16+; MariaDB is not supported by this plan>` |
| Server location (city/country) | `<…>` |
| Remote connections allowed? From any IP? | `<yes/no>` |
| TLS supported? CA certificate available? | `<…>` |
| `max_connections` / `max_user_connections` | `<…>` |
| Can we create multiple DB users with specific grants? | `<…>` |
| Automated backups available? Frequency/retention? | `<…>` |
| Measured latency from Vercel region (P-2) | `<… ms>` |

### 3.2 Database and users (production; run by DB admin)

```sql
CREATE DATABASE dujon_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

CREATE USER 'dujon_app'@'%' IDENTIFIED BY '<strong-random-password>' REQUIRE SSL;
GRANT SELECT, INSERT, UPDATE, DELETE ON dujon_prod.* TO 'dujon_app'@'%';

CREATE USER 'dujon_migrate'@'%' IDENTIFIED BY '<strong-random-password>' REQUIRE SSL;
GRANT ALL PRIVILEGES ON dujon_prod.* TO 'dujon_migrate'@'%';

CREATE USER 'dujon_ops'@'%' IDENTIFIED BY '<strong-random-password>' REQUIRE SSL;
GRANT SELECT ON dujon_prod.* TO 'dujon_ops'@'%';
GRANT UPDATE (status, deleted_at) ON dujon_prod.users TO 'dujon_ops'@'%';
GRANT UPDATE (status) ON dujon_prod.profiles TO 'dujon_ops'@'%';
GRANT UPDATE (status, resolution_note, resolved_at) ON dujon_prod.reports TO 'dujon_ops'@'%';
GRANT INSERT ON dujon_prod.moderation_actions TO 'dujon_ops'@'%';
GRANT DELETE ON dujon_prod.sessions TO 'dujon_ops'@'%';
GRANT DELETE ON dujon_prod.profile_photos TO 'dujon_ops'@'%';
GRANT UPDATE (status, ended_reason, updated_at) ON dujon_prod.interests TO 'dujon_ops'@'%';
```

If the host only allows specific source IPs, restrict `'%'` accordingly (Vercel standard plans have dynamic egress IPs — see doc 06 §7). If the host does not allow `REQUIRE SSL`, record that as a risk and decide with the owner.

### 3.3 Connectivity test (P-2)
A small script `scripts/db-check.ts` (and a temporary, secret-protected route deployed to a Vercel preview) connects with TLS, runs `SELECT 1` ×20, and prints min/avg/p95 latency and server version. Remove the route after the test.

## 4. Environment variables

`.env.example` (committed, placeholders only):

```dotenv
# App
APP_ENV=development                 # development | preview | production
APP_URL=http://localhost:3000

# Database (runtime, least privilege)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=dujon_app
DB_PASSWORD=<placeholder>
DB_NAME=dujon_dev
DB_SSL=false                        # true in preview/production
DB_SSL_CA=                          # optional PEM contents if host uses a private CA
DB_POOL_LIMIT=3

# Migrations (local/CI only — never set in Vercel runtime)
MIGRATION_DATABASE_URL=mysql://dujon_migrate:<placeholder>@127.0.0.1:3306/dujon_dev

# Email
SMTP_HOST=127.0.0.1
SMTP_PORT=1025
SMTP_USER=
SMTP_PASSWORD=
MAIL_FROM="DUJON <no-reply@<domain>>"
OPS_EMAIL=<ops-inbox@domain>

# Object storage (S3-compatible: MinIO locally, Cloudflare R2 in cloud)
S3_ENDPOINT=http://127.0.0.1:9000
S3_REGION=auto
S3_ACCESS_KEY_ID=<placeholder>
S3_SECRET_ACCESS_KEY=<placeholder>
S3_BUCKET=dujon-photos-dev

# Security
CRON_SECRET=<32+ random bytes>
RATE_LIMIT_SALT=<32+ random bytes>

# Ops scripts (local machine only)
OPS_ACTOR=<operator name>
OPS_DATABASE_URL=mysql://dujon_ops:<placeholder>@<host>:3306/dujon_prod

# Optional overrides of doc 03 §2 configuration, e.g.
# INTEREST_DAILY_LIMIT=20
```

Generate secrets with `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`.

## 5. Migrations and seed

- Schema changes: edit `src/server/db/schema.ts` → `pnpm db:generate` → review SQL in `drizzle/` → commit.
- Migrations are **forward-only** and follow **expand → migrate → contract** (add new column, deploy code using both, backfill, remove old column in a later release) so code rollbacks stay safe.
- Production migrations run from the GitHub Actions workflow `migrate-production` (manual trigger, uses `MIGRATION_DATABASE_URL` secret) **before** promoting the matching deployment. Take a fresh backup first (workflow step).
- Seeds: `seed:locations` allowed everywhere; `seed:demo` refuses when `APP_ENV=production` (doc 07 §6).

## 6. GitHub workflow

1. Create a **private** repository `dujon` under the owner's GitHub account/organisation.
2. Branches: `main` (production) and short-lived `feat/<module>` / `fix/<issue>` branches. Protect `main`: PR required, CI must pass, no force-push.
3. Commit messages: Conventional Commits (`feat(auth): add password reset`).
4. CI (`.github/workflows/ci.yml`) on every PR: install → lint → typecheck → i18n check → start MySQL 8 service → migrate test DB → unit/integration tests → build → Playwright smoke → Lighthouse CI (public pages) → `pnpm audit --prod`.
5. Enable Dependabot (or Renovate) and GitHub secret scanning.
6. Never commit `.env*` files except `.env.example`.

Initial push (once the project exists):

```bash
git init
git add .
git commit -m "chore: initial project scaffold"
git branch -M main
git remote add origin https://github.com/<owner>/dujon.git
git push -u origin main
```

## 7. Vercel deployment

1. **Plan:** DUJON is a commercial service → use a Vercel **Pro** team (Hobby is limited to non-commercial use). Confirm current pricing/terms.
2. Import the GitHub repo in Vercel → framework "Next.js" → root `/`.
3. **Environment variables:** set separately for *Development*, *Preview* and *Production*. Preview uses a staging DB (`dujon_staging`) and bucket (`dujon-photos-staging`) — never production data.
4. **Functions:** enable Fluid Compute; set function region closest to MySQL (based on P-2 measurement) in `vercel.json` or project settings.
5. **Cron** (`vercel.json`):

```json
{
  "crons": [
    { "path": "/api/internal/cron/purge", "schedule": "0 21 * * *" }
  ]
}
```
`0 21 * * *` UTC = 03:00 Asia/Dhaka. Vercel sends `Authorization: Bearer <CRON_SECRET>` when `CRON_SECRET` is defined.

6. **Preview protection:** enable Vercel Deployment Protection for previews; previews also send `X-Robots-Tag: noindex` (FR-SEO-006).
7. **Analytics:** enable Web Analytics and Speed Insights (cookie-less).

## 8. Production database connection

- TLS required (`DB_SSL=true`; supply `DB_SSL_CA` if needed); `rejectUnauthorized: true`.
- Runtime uses `dujon_app` only. `dujon_migrate` exists only in the GitHub Actions secret store; `dujon_ops` only on the operator's machine.
- Pool `connectionLimit` 3; check `SHOW STATUS LIKE 'Threads_connected'` during load test and set alerts if near `max_user_connections`.

## 9. Domains and HTTPS

1. Add the domain in Vercel → follow DNS instructions (apex `A` record and `www` `CNAME`, or Vercel nameservers).
2. Vercel provisions and renews TLS certificates automatically.
3. Redirect `www` → apex (or the reverse — choose one canonical host) and update `APP_URL`.
4. Email domain: configure SPF, DKIM and DMARC records for the sending domain (P-5).

## 10. Backups

| What | How | Retention |
|---|---|---|
| MySQL | Host's automated daily backups **plus** a nightly `mysqldump --single-transaction` job (host cron or GitHub Actions) encrypted and copied to a separate storage bucket | ≥ 14 daily, 3 monthly |
| Photos | Bucket lifecycle: none in MVP (members can re-upload); optional weekly sync to a backup bucket [OD-030] | — |
| Code | GitHub | — |
| Config | Environment variable inventory (names only) kept in a private owner document | — |

Restore drill (TC-116) before launch and every quarter: restore latest dump to staging, run smoke tests.

## 11. Rolling back

| Situation | Action |
|---|---|
| Bad application deploy | Vercel → Deployments → previous production deployment → **Instant Rollback** (or `vercel rollback`) |
| Bad migration | Migrations are expand/contract, so roll back code first; fix forward with a new migration. Restore from backup only for data corruption (expect data loss since the backup time — owner decision) |
| Leaked secret | Rotate in provider (DB password, S3 token, SMTP, `CRON_SECRET`), update Vercel env, redeploy; revoke all sessions if session-related |
| Incident affecting members | Hide affected feature via config flag, communicate on site banner, record in incident log |

## 12. Launch checklist (M9)

- [ ] Owner sign-off on acceptance checklist (doc 10 §4)
- [ ] Legal items resolved (doc 09 §12) and pages updated
- [ ] Production env vars set; secrets rotated from dev values
- [ ] Production migrations applied; `seed:locations` run; **no demo data**
- [ ] Custom domain + HTTPS + canonical host redirect
- [ ] SPF/DKIM/DMARC pass (send test emails to Gmail and Outlook)
- [ ] Cron job visible in Vercel and tested
- [ ] Backups running; restore drill passed
- [ ] Uptime monitor on `/` and an authenticated health endpoint
- [ ] Google Search Console + Bing Webmaster: verify domain, submit sitemap
- [ ] `site:<domain>` check after indexing shows only public pages
