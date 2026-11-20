@echo off
REM DUJON local setup for Windows + XAMPP (or MAMP).
REM 1) Open XAMPP Control Panel and Start MySQL (green). 2) Double-click this file.
cd /d "%~dp0"
where node >nul 2>nul || (echo Node.js not found. Install Node 22 LTS from https://nodejs.org then run this again. & pause & goto :eof)
where pnpm >nul 2>nul || (echo Installing pnpm... & call npm install -g pnpm)
if not exist .env.local (
  if /i "%1"=="mamp" (copy local-env\mamp.env .env.local) else (copy local-env\xampp.env .env.local)
)
call pnpm install || goto :err
call pnpm db:migrate || goto :err
call pnpm seed:locations || goto :err
call pnpm seed:demo
echo.
echo ==== DUJON is starting: open http://localhost:3000  (keep this window open) ====
call pnpm dev
goto :eof
:err
echo.
echo Something failed. Copy the text above and send it to Claude.
pause
