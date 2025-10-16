# 📚 GABTA - Sistem Presensi Berbasis Web dengan QR Code dan Geolocation

**GABTA** (Geolocation-Based Attendance Tracking Application) adalah sistem presensi modern yang menggunakan teknologi QR Code dan validasi lokasi GPS untuk memastikan kehadiran mahasiswa secara akurat. Sistem ini sepenuhnya berbasis web untuk kemudahan akses tanpa perlu instalasi aplikasi mobile.

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

### Prerequisites:
- Node.js v22+ (recommended)
- PostgreSQL v12+
- Gmail account atau SMTP server (untuk email verification)

### 1. Setup Backend (10 minutes)

```bash
# Navigate to server
cd server

# Install dependencies
npm install

# Create database
createdb gabta_db

# Configure environment
copy .env.example .env
# Edit .env with your settings:
# - DATABASE_URL (PostgreSQL connection)
# - JWT_SECRET (random string)
# - EMAIL_USER (Gmail address)
# - EMAIL_PASS (Gmail app password)
# - FRONTEND_URL (http://localhost:3000)

# Run migrations
npx sequelize-cli db:migrate

# Seed initial data (admin user + roles)
npx sequelize-cli db:seed:all

# Start server
npm run dev
```

**Default Admin Credentials:**
- Email: admin@gabta.com
- Password: admin123

Server runs on: http://localhost:5000

### 2. Setup Web App (5 minutes)

```bash
# Open new terminal
cd web

# Install dependencies
npm install

# Start development server
npm start
```

Web app runs on: http://localhost:3000

### 3. Setup Email Service (Gmail)

1. Buka [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification**
3. Generate **App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Copy the generated password
4. Update `.env` file:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password (16 characters)
   ```

**Alternative:** Gunakan Mailtrap untuk development testing
npm install

# Start dev server
npm start
```

Web app opens at: http://localhost:3000

**Test Login:**
- **Dosen**: `admin@gabta.com` / `admin123`
- **Mahasiswa**: `mahasiswa@gabta.com` / `mahasiswa123`

### 3. Setup Mobile App (5 minutes)

```bash
# Open new terminal
cd d:\GABTA\mobile

# Install dependencies
npm install

# Start Metro bundler
npm start

# In another terminal, run Android
npm run android
```

**📖 Detailed mobile setup:** See [QUICK_START_MOBILE.md](QUICK_START_MOBILE.md)

## 📱 Mobile Implementation

The mobile app is **fully implemented** with all features:

✅ **QR Scanner Screen** - Camera-based QR scanning with permissions  
✅ **Attendance Submit Screen** - GPS location + distance validation  
✅ **Sessions List Screen** - Grouped by class, real-time status  
✅ **Profile Screen** - Multi-class stats & attendance history  

**Key Files Created:**
- `mobile/src/screens/QRScannerScreen.js` (208 lines)
- `mobile/src/screens/AttendanceSubmitScreen.js` (378 lines)
- `mobile/src/screens/SessionsListScreen.js` (318 lines)
- `mobile/src/screens/ProfileScreen.js` (412 lines)
- `mobile/src/navigation/MainNavigator.js` (updated with bottom tabs)

**Documentation:**
- 📘 [MOBILE_SETUP_GUIDE.md](MOBILE_SETUP_GUIDE.md) - Complete setup instructions
- 📗 [QUICK_START_MOBILE.md](QUICK_START_MOBILE.md) - Fastest way to run
- 📙 [MOBILE_ARCHITECTURE.md](MOBILE_ARCHITECTURE.md) - Visual diagrams & flow
- 📕 [MOBILE_IMPLEMENTATION_SUMMARY.md](MOBILE_IMPLEMENTATION_SUMMARY.md) - What was built

## 📊 Database Schema

**Key Tables:**
- `roles` - User roles (dosen, mahasiswa)
- `users` - User accounts with role_id
- `sessions` - Attendance sessions with **radiusMeters** & **className**
- `attendance_records` - Attendance submissions with status & timestamp

**Recent Additions:**
- ✅ `sessions.radius_meters` (INTEGER, default 50, range 10-1000)
- ✅ `sessions.class_name` (STRING, nullable) for multi-class support

## 📂 Struktur Proyek

```
├── /server                 # Backend API 
│   ├── /src 
│   │   ├── /config         # App configuration 
│   │   ├── /controllers    # Route controllers 
│   │   ├── /middlewares    # Express middlewares 
│   │   ├── /models         # Database models (Sequelize)
│   │   ├── /routes         # API routes 
│   │   ├── /services       # Business logic 
│   │   ├── /utils          # Utility functions 
│   │   └── app.js          # Express app setup 
│   ├── .sequelizerc        # Sequelize CLI mapping to src/*
│   ├── package.json 
│   └── .env.sample         # Environment variables template 
│ 
├── /web                    # React web application 
│   ├── /public 
│   ├── /src 
│   │   ├── /assets         # Static assets 
│   │   ├── /components     # Reusable components 
│   │   ├── /context        # React context providers 
│   │   ├── /pages          # Page components 
│   │   ├── /services       # API services 
│   │   ├── /utils          # Utility functions 
│   │   └── App.js          # Main component 
│   └── package.json 
│ 
├── /mobile                 # React Native application 
│   ├── /android            # Android native code 
│   ├── /ios                # iOS native code 
│   ├── /src 
│   │   ├── /assets         # Static assets 
│   │   ├── /components     # Reusable components 
│   │   ├── /navigation     # Navigation configuration 
│   │   ├── /screens        # Screen components 
│   │   ├── /services       # API services 
│   │   └── /utils          # Utility functions 
│   └── package.json 
│ 
└── README.md               # Project documentation 
```

## Memulai

### Server (Backend)

```bash
cd server
npm install
# Salin .env.sample ke .env dan sesuaikan konfigurasi database Postgres
# Jalankan migrasi dan seeder
npm run migrate
npm run seed
# Jalankan server
npm run dev
```

Swagger tersedia di http://localhost:5000/api/docs (non-production).

### Web (Frontend)

```bash
cd web
npm install
# Opsional: buat .env dengan REACT_APP_API_URL=http://localhost:5000/api
npm start
```

### Mobile

```bash
cd mobile
npm install
# Emulator Android mengakses host lewat 10.0.2.2
npm run android
```

## Teknologi yang Digunakan

### Backend
- Node.js
- Express.js
- PostgreSQL + Sequelize

### Web
- React (CRA)
- React Router
- Axios

### Mobile
- React Native
- React Navigation