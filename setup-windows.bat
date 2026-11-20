@echo off
REM DUJON local setup for Windows + MAMP. Start MAMP first (green MySQL light), then double-click this file.
where pnpm >nul 2>nul || (echo Installing pnpm... & call npm install -g pnpm)
if not exist .env.local copy .env.mamp .env.local
call pnpm install || goto :err
call pnpm db:migrate || goto :err
call pnpm seed:locations || goto :err
call pnpm seed:demo
echo.
echo Starting DUJON at http://localhost:3000  (English: http://localhost:3000/en)
call pnpm dev
goto :eof
:err
echo.
echo Something failed. Copy the red text above and send it to Claude.
pause
