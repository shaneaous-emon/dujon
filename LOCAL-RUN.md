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

## Windows + XAMPP (easiest)
1. Open XAMPP Control Panel and press Start next to MySQL (it turns green; port 3306, user root, no password).
   Apache is not needed — Next.js runs its own server on port 3000.
2. Install Node 22 LTS from nodejs.org if `node -v` fails.
3. In the project folder, double-click `setup-windows.bat`. First run takes a few minutes.
4. Open http://localhost:3000 and keep the black window open (closing it stops the site).
5. Demo login: demo+male1@example.invalid / Demo-pass-2026. Emails (verify/reset links) are saved in `.data/mail/`.
Next time: start MySQL in XAMPP, then run `pnpm dev` in the folder.
MAMP instead of XAMPP: run `setup-windows.bat mamp` (port 8889, root/root).
If your MySQL has a password or other port, edit `.env.local` (DB_PASSWORD, DB_PORT).
