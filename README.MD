# 📚 GABTA - Sistem Presensi QR Code + GPS

**GABTA** (Geolocation-Based Attendance Tracking Application) adalah sistem presensi berbasis web dengan QR Code scanning dan validasi lokasi GPS. Tanpa perlu install aplikasi mobile.

**Quick Links:**
- 📖 [Panduan Instalasi Lengkap](PANDUAN_INSTALASI.md) - Bahasa Indonesia
- 📧 [Setup Email (Mailtrap)](SETUP_MAILTRAP.md) - 5 menit
- 🖥️ [One-Click Installer](setup-windows.bat) - Windows .bat file

## ✨ Fitur Utama

### 🎓 Untuk Dosen/Admin:
- ✅ **Create Session** dengan radius kustom (10-1000m), nama kelas, kode kelas, dan kapasitas maksimal
- ✅ **QR Code Display** dengan auto-refresh setiap 30 detik (centered & large display)
- ✅ **Dashboard** dengan grouping session per kelas
- ✅ **Class Management** untuk melihat rekap per kelas dengan detail setiap pertemuan
- ✅ **Edit Attendance** secara manual dengan catatan/alasan
- ✅ **Export to Excel** dengan data lengkap (NIM/NIP, Nama, Email, Status)
- ✅ **Participant List** dengan NIM, nama lengkap, email, waktu presensi
- ✅ **Capacity Tracking** untuk monitor batas peserta kelas

### 👨‍🎓 Untuk Mahasiswa:
- ✅ **Browser-Based QR Scanning** tanpa perlu install app (menggunakan HTML5 QR Code)
- ✅ **Manual Token Entry** sebagai fallback
- ✅ **GPS Location Validation** otomatis saat scan
- ✅ **Profile Page** dengan edit nama, statistik per kelas, dan riwayat kehadiran
- ✅ **Real-time Status** (Hadir/Terlambat/Tidak Hadir)

### 🔐 Authentication & Security:
- ✅ **Email Verification** dengan auto-send verification email
- ✅ **Auto-Login** setelah verifikasi email berhasil
- ✅ **NIM/NIP Registration** untuk identifikasi mahasiswa dan dosen
- ✅ **Auto Role Assignment** berdasarkan email domain (@students.um.ac.id)
- ✅ **JWT Authentication** dengan expiry token
- ✅ **Password Hashing** menggunakan bcrypt

### 📊 Backend API:
- ✅ **RESTful API** dengan JWT authentication
- ✅ **Dynamic Radius Validation** (10m - 1000m per session)
- ✅ **Token System** dengan expiry 30 detik untuk keamanan
- ✅ **Distance Calculation** menggunakan Haversine formula
- ✅ **Email Service** untuk verification dan welcome emails
- ✅ **Multi-Class Support** dengan className dan kodeKelas
- ✅ **Capacity Management** untuk limit peserta per session

## 🏗️ Tech Stack

**Backend:**
- Node.js 22.15.0 + Express.js
- PostgreSQL + Sequelize ORM 6.37.7
- JWT Authentication
- bcrypt untuk password hashing
- nodemailer untuk email verification
- QRCode untuk generate QR images
- crypto untuk token generation

**Web Frontend:**
- React 17.0.2
- React Router v6
- React Bootstrap 2.2.1
- Formik + Yup (form validation)
- Axios (API calls)
- html5-qrcode (browser QR scanning)
- xlsx (Excel export)
- Bootstrap Icons

**Database Schema:**
- Users (dengan NIM/NIP, email verification)
- Roles (participant, committee, admin)
- Sessions (dengan kodeKelas, maxCapacity)
- AttendanceRecords (dengan notes, updatedBy)

## 🚀 Quick Start

### One-Click Setup (Windows)
```powershell
# Double-click file ini:
setup-windows.bat
```

Script otomatis install dependencies, setup database, dan start servers.

### Manual Setup (Semua OS)
Ikuti panduan lengkap: **[PANDUAN_INSTALASI.md](PANDUAN_INSTALASI.md)**

**TL;DR:**
```bash
# 1. Install dependencies
cd server && npm install
cd ../web && npm install

# 2. Setup database & env
createdb gabta_db
cd server && copy .env.example .env
# Edit .env (DB, JWT, EMAIL) - Lihat SETUP_MAILTRAP.md

# 3. Migrate & seed
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all

# 4. Start servers
npm run dev              # backend (port 5000)
cd ../web && npm start   # frontend (port 3000)

```

## 🧪 Test Credentials

**Dosen (Admin):**
- Email: `admin@gabta.com`
- Password: `admin123`

**Mahasiswa:**
- Register di http://localhost:3000/register
- Email: `test@students.um.ac.id` (auto-assign role mahasiswa)
- Check Mailtrap untuk verification email

## 📖 Dokumentasi

### Setup & Installation
- [PANDUAN_INSTALASI.md](PANDUAN_INSTALASI.md) - Panduan lengkap Bahasa Indonesia
- [SETUP_MAILTRAP.md](SETUP_MAILTRAP.md) - Setup email testing (5 menit)
- [setup-windows.bat](setup-windows.bat) - One-click installer Windows

### Fitur & Testing
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Test semua fitur end-to-end
- [TESTING_SWAGGER.md](TESTING_SWAGGER.md) - Test API via Swagger UI
- [CHANGELOG.md](CHANGELOG.md) - Riwayat perubahan versi

### Mobile App (Optional)
- [MOBILE_SETUP_GUIDE.md](MOBILE_SETUP_GUIDE.md) - Setup React Native
- [QUICK_START_MOBILE.md](QUICK_START_MOBILE.md) - Quick start mobile
- [MOBILE_ARCHITECTURE.md](MOBILE_ARCHITECTURE.md) - Arsitektur mobile app
- [MOBILE_IMPLEMENTATION_SUMMARY.md](MOBILE_IMPLEMENTATION_SUMMARY.md) - Detail implementasi

### Technical Details
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Detail implementasi fitur

## 🏗️ Struktur Folder

```
GABTA/
├── server/              # Backend (Node.js + Express)
│   ├── src/
│   │   ├── controllers/ # API handlers
│   │   ├── models/      # Database models
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   └── middlewares/ # Auth & error handlers
│   ├── migrations/      # DB migrations
│   └── seeders/        # Seed data
├── web/                # Frontend (React)
│   └── src/
│       ├── pages/       # Page components
│       ├── components/  # Reusable UI
│       ├── context/     # State management
│       └── services/    # API calls
└── mobile/             # React Native (optional)
    └── src/
        ├── screens/     # Mobile screens
        └── navigation/  # Navigation config

### Web
- React (CRA)
- React Router
- Axios

### Mobile
- React Native
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open Pull Request

## 📝 License

MIT License - Lihat [LICENSE](LICENSE) untuk detail

## 👥 Team

Developed by **Nael Rudd** - [naelrudd](https://github.com/naelrudd)

GitHub Repository: [https://github.com/naelrudd/GABTA](https://github.com/naelrudd/GABTA)

## 🐛 Troubleshooting

**Port sudah dipakai:**
```powershell
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Database connection error:**
- Pastikan PostgreSQL running
- Check credentials di `.env`

**Email tidak terkirim:**
- Check Mailtrap credentials
- Restart backend setelah update `.env`

**Frontend tidak connect ke backend:**
- Pastikan backend running di port 5000
- Check CORS_ORIGIN di `.env`

Lihat [PANDUAN_INSTALASI.md](PANDUAN_INSTALASI.md) untuk troubleshooting lengkap.