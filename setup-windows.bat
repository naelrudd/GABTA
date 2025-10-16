@echo off
REM GABTA - Windows Quick Setup Script
REM Usage: Right-click -> Run as administrator (optional). This script helps new contributors get running on Windows.

echo ==================================================
echo GABTA - Quick Windows setup
echo ==================================================
echo 1) Copy example env files into place if they don't exist
nif not exist server\.env (
  copy server\.env.example server\.env >nul
  echo Created server\.env from server\.env.example (please edit values: DB, JWT, EMAIL, FRONTEND_URL)
) else (
  echo server\.env already exists - leave as-is
)

necho.
echo 2) Install server dependencies (this may take a few minutes)
pushd server
if exist package.json (
  echo Installing server npm packages...
  call npm install
) else (
  echo server/package.json not found; skipping npm install for server
)
popd

necho.
echo 3) Install web dependencies
pushd web
if exist package.json (
  echo Installing web npm packages...
  call npm install
) else (
  echo web/package.json not found; skipping npm install for web
)
popd

necho.
echo 4) Run migrations and seed (server)
pushd server
if exist node_modules\sequelize-cli (
  echo Running migrations...
  call npx sequelize-cli db:migrate
  echo Running seeders...
  call npx sequelize-cli db:seed:all
) else (
  echo sequelize-cli not installed locally. Attempting to run npx migrations anyway...
  call npx sequelize-cli db:migrate
  call npx sequelize-cli db:seed:all
)
popd

necho.
echo 5) Start dev servers (you can run these separately if you prefer)
necho   - Backend (server): runs on http://localhost:5000
necho   - Frontend (web): runs on http://localhost:3000
necho
necho To start servers now, press Y. To skip, press any other key.
choice /c YN /n /m "Start dev servers now? (Y to start, N to skip)"
if errorlevel 2 goto end

necho Starting server in new window...
start cmd /k "cd /d %~dp0server && npm run dev"

necho Starting web in new window...
start cmd /k "cd /d %~dp0web && npm start"

necho.
necho Optional: remove server/.env from git index to avoid committing secrets.
necho If server/.env was already committed in the past you should rotate secrets after removing.
necho Do you want to remove server/.env from git index now? (recommended)
choice /c YN /n /m "Remove server/.env from git index? (Y/N)"
if errorlevel 2 goto end

necho Removing server/.env from git index...
ngit rm --cached server/.env || echo Failed to remove from index (maybe not tracked)
ngit add .gitignore || echo Failed to add .gitignore
ngit commit -m "chore: ignore server/.env and remove from git index" || echo Commit failed - please run git commit manually

necho Done. Please rotate any credentials that were possibly committed in the past.

n:end
echo Setup script finished.
pause
