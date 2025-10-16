# GABTA - Panduan Instalasi dan Menjalankan

Panduan singkat untuk setup dan menjalankan aplikasi GABTA di Windows.

## Apa itu GABTA?

GABTA (Geolocation-Based Attendance Tracking Application) adalah sistem presensi berbasis web dengan fitur:
- ✅ QR Code scanning di browser (tanpa install app)
- ✅ Validasi lokasi GPS otomatis
- ✅ Email verification untuk keamanan
- ✅ Management kelas untuk dosen
- ✅ Export rekap ke Excel

**Role:**
- **Dosen**: Buat session, lihat QR code, kelola rekap kelas
- **Mahasiswa**: Scan QR atau input manual, lihat riwayat kehadiran

## Prerequisites (Install Dulu)

1. **Node.js** v14+ → [Download](https://nodejs.org)
2. **PostgreSQL** v12+ → [Download](https://www.postgresql.org/download/)
3. **Git** (optional) → [Download](https://git-scm.com)

## Quick Start (One-Click Installer)

### Cara Tercepat:
1. Double-click file `setup-windows.bat` di folder root
2. Script akan otomatis:
   - Copy `.env.example` → `.env` (edit values-nya setelah ini)
   - Install dependencies (server & web)
   - Run database migrations & seeders
   - Start kedua server (backend + frontend)

### Edit `.env` setelah installer selesai:
```bash
cd d:\GABTA\server
notepad .env

# Edit values ini:
DB_PASSWORD=your_postgres_password
JWT_SECRET=random_string_min_32_chars
EMAIL_USER=your_mailtrap_username
EMAIL_PASS=your_mailtrap_password
```

**Cara dapat EMAIL credentials:** Lihat [SETUP_MAILTRAP.md](SETUP_MAILTRAP.md)

## Manual Installation (Jika Prefer Step-by-Step)

### 1. Setup Database
```powershell
# Create database PostgreSQL
createdb gabta_db
```

### 2. Install Dependencies
```powershell
# Server
cd d:\GABTA\server
npm install

# Web
cd d:\GABTA\web
npm install
```

### 3. Configure Environment
```powershell
cd d:\GABTA\server
copy .env.example .env
notepad .env
```

Edit `.env`:
```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gabta_db
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_random_secret_min_32_chars
JWT_EXPIRES_IN=24h

# Mailtrap (recommended for dev) - See SETUP_MAILTRAP.md
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your_mailtrap_username
EMAIL_PASS=your_mailtrap_password

FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

### 4. Run Migrations & Seed
```powershell
cd d:\GABTA\server
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

### 5. Start Servers
```powershell
# Terminal 1 - Backend (port 5000)
cd d:\GABTA\server
npm run dev

# Terminal 2 - Frontend (port 3000)
cd d:\GABTA\web
npm start
```

## Test Login

### Dosen (Admin)
- URL: http://localhost:3000/login
- Email: `admin@gabta.com`
- Password: `admin123`

### Mahasiswa
- URL: http://localhost:3000/register
- Register dengan email: `test@students.um.ac.id`
- Check Mailtrap untuk verification email
- Klik link → auto-login

## Fitur Utama dan Cara Pakai

### 1. Dosen: Buat Session Presensi
1. Login sebagai dosen
2. Klik "Create Session"
3. Isi form:
   - Nama session
   - Nama kelas & kode kelas
   - Waktu mulai & selesai
   - Lokasi (get current location atau input manual)
   - Radius validasi (10-1000m)
   - Kapasitas maksimal (optional)
4. Klik "Create Session"
5. QR code akan muncul di session details (auto-refresh setiap 30 detik)

### 2. Mahasiswa: Submit Presensi
**Via QR Scan:**
1. Buka http://localhost:3000/scan (atau dari dashboard)
2. Allow camera permission
3. Arahkan ke QR code di layar dosen
4. Auto-submit presensi

**Via Manual:**
1. Masukkan 6-digit token dari QR display
2. Lokasi GPS diambil otomatis
3. Klik "Submit"

### 3. Dosen: Lihat Rekap & Export
1. Dashboard → Klik "Class Management"
2. Pilih kelas
3. Lihat detail setiap session + participant list
4. Edit manual jika perlu (tambah notes/reason)
5. Klik "Export to Excel" untuk download rekap lengkap

## Troubleshooting

### Port 5000 sudah dipakai
```powershell
# Cari process yang pakai port 5000
netstat -ano | findstr :5000

# Kill process (ganti PID)
taskkill /PID <PID> /F
```

### Database connection error
- Pastikan PostgreSQL running
- Check DB credentials di `.env`
- Test connection: `psql -U postgres -d gabta_db`

### Email tidak terkirim
- Check Mailtrap credentials di `.env`
- Restart backend setelah update `.env`
- Check backend console untuk error log

### Web app tidak bisa access backend
- Pastikan backend running di port 5000
- Check CORS_ORIGIN di `.env` sesuai frontend URL
- Clear browser cache & reload

## File Penting

- `server/.env` → Environment variables (JANGAN commit!)
- `server/.env.example` → Template untuk `.env`
- `setup-windows.bat` → One-click installer
- `SETUP_MAILTRAP.md` → Panduan setup email testing
- `.gitignore` → File yang diabaikan git (termasuk `.env`)

## Struktur Folder

```
GABTA/
├── server/          # Backend API (Node.js + Express)
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── middlewares/   # Auth & error handlers
│   ├── migrations/        # DB migrations
│   └── seeders/          # Initial data
├── web/             # Frontend (React)
│   └── src/
│       ├── pages/         # Page components
│       ├── components/    # Reusable components
│       ├── context/       # State management
│       └── services/      # API calls
└── mobile/          # React Native (optional, belum dipakai)
```

## Tech Stack

**Backend:**
- Node.js + Express
- PostgreSQL + Sequelize
- JWT Authentication
- Nodemailer (email)

**Frontend:**
- React 17
- React Router v6
- React Bootstrap
- html5-qrcode (browser QR scan)
- xlsx (Excel export)

## Next Steps

1. ✅ Setup Mailtrap → [SETUP_MAILTRAP.md](SETUP_MAILTRAP.md)
2. ✅ Test registration + email verification flow
3. ✅ Create session sebagai dosen
4. ✅ Scan QR sebagai mahasiswa
5. ✅ Export rekap ke Excel

## Butuh Bantuan?

- Check backend logs di terminal server
- Check browser console untuk frontend errors
- Gunakan Swagger API docs: http://localhost:5000/api/docs (jika tersedia)
- File issue di GitHub: https://github.com/naelrudd/GABTA

## Production Deployment

Untuk production:
1. Gunakan Gmail App Password (bukan Mailtrap)
2. Set `NODE_ENV=production`
3. Generate strong `JWT_SECRET` (min 32 chars random)
4. Setup PostgreSQL di cloud (Heroku, AWS RDS, dll)
5. Deploy backend ke Heroku/VPS
6. Deploy frontend ke Vercel/Netlify
7. Update `FRONTEND_URL` dan `CORS_ORIGIN`
