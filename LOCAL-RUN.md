# Run DUJON on your own computer (Windows / Mac / Linux)

Needs: Node 22, pnpm (`npm i -g pnpm`), Docker Desktop (for MySQL).

```
pnpm install
docker compose up -d
copy .env.example .env.local     (Mac/Linux: cp .env.example .env.local)
```
Edit `.env.local`: DB_HOST=127.0.0.1, DB_PORT=3306, DB_USER=dujon, DB_PASSWORD=dujon_dev, DB_NAME=dujon,
APP_ENV=development, APP_URL=http://localhost:3000, MAIL_DRIVER=file, STORAGE_DRIVER=local,
and any long random text for CRON_SECRET and RATE_LIMIT_SALT.

```
pnpm db:migrate
pnpm seed:locations
pnpm seed:demo        (optional: clearly labelled [DEMO] members)
pnpm dev
```
Open http://localhost:3000 (Bangla) and http://localhost:3000/en (English).
Demo login: demo+male1@example.invalid / Demo-pass-2026. Emails are written to `.data/mail/*.json` (open the file to find the confirm link).
