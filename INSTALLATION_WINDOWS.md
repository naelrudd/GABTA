GABTA - Installation & Run Guide (Windows)
===========================================

This file contains a short, focused installation and running guide for Windows users plus a quick list of what each component does.

1) Prerequisites
-----------------
- Node.js (v14+) and npm installed and in PATH
- PostgreSQL installed and a database created (see below)
- Git installed (optional, but recommended)

2) Quick one-click setup (recommended)
--------------------------------------
- Double-click (or Run) `setup-windows.bat` in the repository root.
- The script will:
  - Create `server/.env` from `server/.env.example` if missing (you must edit values for DB, JWT, EMAIL, FRONTEND_URL)
  - Install server and web dependencies (npm install)
  - Run Sequelize migrations and seeders
  - Optionally start both server and web dev servers in new terminals
  - Optionally remove `server/.env` from the git index to avoid committing secrets

3) Manual steps (if you prefer)
--------------------------------
A. Prepare environment file
- Copy `server/.env.example` to `server/.env` and edit the placeholders:
  - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
  - `JWT_SECRET` (set a random string)
  - `EMAIL_*` (use Mailtrap or Gmail app password) — For development, Mailtrap is recommended.
  - `FRONTEND_URL` (http://localhost:3000)

B. Install dependencies
```powershell
cd d:\GABTA\server
npm install
cd ..\web
npm install
```

C. Create database and run migrations
```powershell
# create a postgres DB named gabta_db (example)
createdb gabta_db
cd d:\GABTA\server
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

D. Start dev servers
```powershell
# Start server (port 5000)
cd d:\GABTA\server
npm run dev

# In a new terminal, start web (port 3000)
cd d:\GABTA\web
npm start
```

4) What each component does (short)
-----------------------------------
- server/: Backend API (Node.js + Express + Sequelize)
  - Handles auth, sessions, attendance, email verification and exports.
- web/: Frontend React app (React + Bootstrap)
  - UI for Dosen and Mahasiswa: create sessions, show QR, scan in browser, class management, exports.
- mobile/: (optional) React Native client for scanning and submission (already implemented but optional)

5) Running tests and manual checks
----------------------------------
- Use Swagger UI: http://localhost:5000/api/docs to exercise endpoints interactively.
- Typical test flow: Register -> Verify email (Mailtrap) -> Login -> Create session (dosen) -> Scan/Manual submit (mahasiswa)

6) Security reminder
---------------------
- Do not commit `server/.env` with real credentials. If it was ever committed, rotate (change) the credentials immediately.
- Use Mailtrap for local email testing (no real emails sent).

7) If you want me to run steps A/B for you, say so and I'll execute them (I can update .gitignore and optionally remove server/.env from git index).