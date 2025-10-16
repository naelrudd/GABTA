# 📱 Panduan Scanning QR dari HP

## ✨ Fitur Baru: Mobile-Friendly QR Scanning

Sekarang kamu bisa langsung scan QR code dari browser HP tanpa install aplikasi!

## 🚀 Cara Pakai

### 1. **Akses dari HP Kamu** - 3 Cara Mudah! 

**Cara 1: Scan QR Code** 📱 (PALING MUDAH & OTOMATIS!)
- Dosen tampilkan QR code di layar
- Buka **kamera HP** → Scan QR code
- **Otomatis buka browser** ke halaman scan! ✨
- QR code sekarang berisi **URL langsung** dengan token: `http://192.168.18.8:3000/scan?sessionId=xxx&token=yyy`
- Login/Register (kalau perlu)
- **Presensi langsung tercatat!** Tidak perlu scan lagi! 🎉

**Cara 2: Klik Link dari QR Display** 🔗
- Dosen tampilkan layar SessionDetails
- Klik link "📱 Atau Buka dari HP: http://..."
- Langsung masuk ke `/scan`

**Cara 3: Ketik Manual** ⌨️
- Buka browser di HP (Chrome, Safari, dll)
- Ketik: `http://192.168.18.8:3000/scan`
- Ganti `192.168.18.8` dengan IP komputer server

> **✨ NEW!** QR code sekarang sudah include server URL otomatis! Mahasiswa bisa langsung akses tanpa perlu tahu IP manual.

### 2. **Auto-Redirect Flow** ✨

Sistem akan otomatis mengarahkan kamu:

```
/scan → /login (kalau belum login) → /register (kalau belum punya akun) → kembali ke /scan
```

**Flow lengkap:**
- 🔍 Buka `/scan` → **Belum login?** → Auto-redirect ke `/login`
- 🔑 Login → **Belum punya akun?** → Klik "Register" → Isi form
- 📝 Setelah register → Auto-redirect ke `/login` dengan pesan sukses
- ✅ Login berhasil → **Langsung balik ke `/scan`**
- 📸 Camera auto-start → Scan QR code dosen
- ✔️ Presensi tercatat!

### 3. **Persiapan Sebelum Scan** 📋

Pastikan:
- ✅ **Lokasi/GPS aktif** di HP (untuk validasi lokasi)
- ✅ **Izin kamera diberikan** ke browser
- ✅ **Koneksi WiFi sama** dengan komputer server
- ✅ **Backend server running** di port 5000

### 4. **Cara Daftar Akun Baru** 📝

1. Di halaman Register, isi:
   - Email UM (contoh: `nadir.putra@students.um.ac.id`)
   - Password (min 6 karakter)
   - Nama depan & belakang
   - NIM/NIP otomatis terdeteksi dari email

2. Klik **Register**
3. Tunggu 3 detik → Auto-redirect ke Login
4. Login dengan akun baru kamu
5. Langsung balik ke `/scan` dengan camera auto-start! 🎉

### 5. **Tips Mobile Scanning** 💡

- **Camera auto-start**: Begitu masuk `/scan`, kamera langsung nyala
- **Arahkan QR code**: Posisikan QR code di tengah kotak scan
- **Cahaya cukup**: Pastikan QR code terlihat jelas
- **Torch button**: Pakai tombol flash kalau gelap
- **Zoom in/out**: Sesuaikan jarak kalau QR terlalu kecil/besar

## 🔧 Setup untuk Admin/Dosen

### Start Backend & Frontend:

```powershell
# Terminal 1 - Backend
cd D:\GABTA\server
npm run dev

# Terminal 2 - Frontend (opsional, karena react-scripts suka exit sendiri)
cd D:\GABTA\web
npm start
```

### Akses dari Jaringan Lokal:

1. **Cek IP komputer server:**
   ```powershell
   ipconfig | findstr "IPv4"
   ```
   Output: `192.168.18.8` (contoh)

2. **Kasih tau mahasiswa untuk akses:**
   ```
   http://192.168.18.8:3000/scan
   ```

3. **Pastikan Windows Firewall allow port 3000 & 5000**
   ```powershell
   # Buka port untuk React dev server (port 3000)
   New-NetFirewallRule -DisplayName "React Dev Server" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow

   # Buka port untuk Node backend (port 5000)
   New-NetFirewallRule -DisplayName "Node Backend" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
   ```

## 🎯 Test Credentials

**Mahasiswa:**
- Email: `mahasiswa.test@students.um.ac.id`
- Password: `password123`

**Dosen:**
- Email: `dosen.test@lecturer.um.ac.id`
- Password: `password123`

**Admin:**
- Email: `admin@um.ac.id`
- Password: `Admin123!`

## 📊 Cara Dosen Buat Session QR

1. Login sebagai dosen
2. Klik **"Buat Sesi"** di Navbar
3. Isi detail sesi (nama matkul, ruangan, dll)
4. QR code akan muncul
5. Tampilkan QR code ke mahasiswa
6. Mahasiswa scan dari HP → Presensi tercatat! ✅

## ❓ Troubleshooting

### Problem: "Connection refused" saat akses dari HP

**Solusi:**
1. Pastikan PC dan HP di WiFi yang sama
2. Cek firewall Windows (allow port 3000 & 5000)
3. Restart backend & frontend jika perlu
4. Test akses dari browser PC dulu: `http://localhost:3000`

### Problem: Camera tidak muncul

**Solusi:**
1. Pastikan browser minta izin kamera → **Allow**
2. Refresh halaman
3. Coba browser lain (Chrome recommended)
4. Setting HP: Privacy → Camera → Allow untuk browser

### Problem: "Lokasi belum tersedia"

**Solusi:**
1. Aktifkan GPS/Location di HP
2. Browser akan minta izin lokasi → **Allow**
3. Klik tombol "Refresh Lokasi" di halaman scan

### Problem: Backend error "nodemailer.createTransporter is not a function"

**Solusi:** Sudah fixed! Typo di email.service.js sudah diperbaiki.

### Problem: Login gagal "Email belum diverifikasi"

**Solusi:** Email verification sudah **di-disable** untuk development. Bisa langsung login tanpa verifikasi email.

## 🎉 What's New?

### ✅ Perubahan yang Sudah Dilakukan:

1. **Auto-redirect flow** dari `/scan` → `/login` → `/register` → balik ke `/scan`
2. **Camera auto-start** begitu masuk halaman scan (kalau lokasi sudah tersedia)
3. **Mobile-friendly** dengan responsive design & auto-focus
4. **Email verification disabled** untuk development (bisa langsung login tanpa verif)
5. **Fixed React hooks violations** di Register.js (no ESLint errors)
6. **Fixed nodemailer typo** (createTransporter → createTransport)

### 📱 Navbar Link untuk Mahasiswa:

Di Navbar, mahasiswa akan lihat:
- 📱 **Scan QR** → Langsung ke `/scan`
- 👤 **Profil** → Lihat data diri

### 🎓 Navbar Link untuk Dosen:

Di Navbar, dosen akan lihat:
- 📊 **Dashboard** → Overview sesi & presensi
- ➕ **Buat Sesi** → Generate QR code baru
- 📚 **Kelola Kelas** → Manage mata kuliah

## 📝 Catatan Penting

- **Port 3000**: Frontend React (Web UI)
- **Port 5000**: Backend API (Node.js + Express)
- **Database**: PostgreSQL `gabta_db` (harus sudah dibuat manual via pgAdmin)
- **Email**: Mailtrap untuk development (tidak kirim email sungguhan)
- **QR Code Format**: Sekarang include `serverUrl`, `webUrl`, dan `scanUrl` untuk akses mudah dari mobile
- **Auto IP Detection**: Set `SERVER_URL` dan `WEB_URL` di `.env` dengan IP jaringan lokal kamu

## 🔐 Security Notes

- Email verification **disabled** hanya untuk development
- Production: Enable kembali verifikasi di `auth.controller.js`
- CORS: Sudah dikonfigurasi untuk accept local network
- JWT expiry: 24 jam (bisa disesuaikan di `.env`)

---

**Happy Scanning! 🎉📱**

Jika ada pertanyaan atau error, hubungi admin atau cek log di terminal backend.
