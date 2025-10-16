# Panduan Testing API via Swagger

Swagger UI tersedia di: **http://localhost:5000/api/docs**

## Urutan Testing End-to-End

### 1. Login sebagai Dosen (Admin/Committee)
1. Buka Swagger UI
2. Cari endpoint **POST /api/auth/login**
3. Klik "Try it out"
4. Isi request body:
   ```json
   {
     "email": "admin@gabta.com",
     "password": "admin123"
   }
   ```
5. Klik **Execute**
6. Copy **accessToken** dari response
7. Klik tombol **Authorize** di atas (ikon gembok)
8. Paste token dengan format: `Bearer <token>`
9. Klik **Authorize**

### 2. Buat Session Baru (Dosen)
1. Cari endpoint **POST /api/sessions**
2. Klik "Try it out"
3. Isi request body:
   ```json
   {
     "name": "Kelas Algoritma",
     "startTime": "2025-10-16T08:00:00Z",
     "endTime": "2025-10-16T10:00:00Z",
     "locationLat": -6.200000,
     "locationLng": 106.816666
   }
   ```
   **Catatan waktu:** Gunakan waktu yang masih aktif (startTime < sekarang < endTime)
4. Klik **Execute**
5. Copy **session.id** dari response

### 3. Ambil QR Code & Manual Token (Dosen)
1. Cari endpoint **GET /api/sessions/{id}/qr**
2. Klik "Try it out"
3. Paste **session.id** di parameter `id`
4. Klik **Execute**
5. Response berisi:
   - `token` (JWT untuk QR scan, valid 30s)
   - `manualCode` (6-digit code untuk input manual)
   - `manualToken` (JWT untuk manual entry, valid 30s)
   - `qrCodeImage` (base64 image)
6. Copy salah satu token (akan dipakai mahasiswa untuk presensi)

**Penting:** Token ini expire dalam 30 detik. Jika sudah lewat, request ulang endpoint ini untuk dapat token baru.

### 4. Register & Login sebagai Mahasiswa
1. Cari endpoint **POST /api/auth/register**
2. Klik "Try it out"
3. Isi request body:
   ```json
   {
     "email": "alice@student.com",
     "password": "alice123",
     "firstName": "Alice",
     "lastName": "Student"
   }
   ```
4. Klik **Execute** (user baru akan otomatis role `participant`)
5. Login dengan user baru:
   - Endpoint **POST /api/auth/login**
   - Body: `{"email": "alice@student.com", "password": "alice123"}`
6. Copy **accessToken** mahasiswa
7. **Authorize** lagi dengan token mahasiswa (ganti token dosen)

### 5. Submit Attendance (Mahasiswa)
1. Cari endpoint **POST /api/attendance/submit**
2. Klik "Try it out"
3. Isi request body:
   ```json
   {
     "sessionId": "<paste session.id dari step 2>",
     "token": "<paste token dari step 3>",
     "locationLat": -6.200000,
     "locationLng": 106.816666,
     "isManual": false
   }
   ```
   **Catatan lokasi:** Gunakan koordinat yang **sama atau sangat dekat** (≤50m) dengan lokasi session agar lolos validasi.
   
   **Jika pakai manual token:** Set `"isManual": true` dan gunakan `manualToken` di field `token`.

4. Klik **Execute**
5. Response 201 = berhasil presensi

### 6. Lihat Daftar Kehadiran (Dosen)
1. **Authorize** ulang dengan token dosen (dari step 1)
2. Cari endpoint **GET /api/attendance/session/{sessionId}**
3. Klik "Try it out"
4. Paste **session.id** di parameter `sessionId`
5. Klik **Execute**
6. Response berisi list semua mahasiswa yang sudah presensi

### 7. Lihat Statistik User (Mahasiswa)
1. **Authorize** dengan token mahasiswa
2. Cari endpoint **GET /api/attendance/stats/user**
3. Klik "Try it out"
4. Klik **Execute** (tanpa parameter)
5. Response berisi total, present, late, absent

### 8. Lihat Rekap Session (Dosen)
1. **Authorize** dengan token dosen
2. Cari endpoint **GET /api/attendance/stats/session/{sessionId}**
3. Klik "Try it out"
4. Paste **session.id**
5. Klik **Execute**
6. Response berisi statistik kehadiran session

---

## Testing Kasus Error

### Test 1: Token Expired
- Tunggu >30 detik setelah ambil QR token
- Submit attendance → expect error "Invalid or expired token"

### Test 2: Lokasi Terlalu Jauh
- Submit attendance dengan koordinat yang berbeda jauh (>50m) dari session location
- Expect error "You must be within 50 meters..."

### Test 3: Duplicate Attendance
- Submit attendance 2x oleh user yang sama
- Expect error "Attendance already recorded for this session"

### Test 4: Session Tidak Aktif
- Buat session dengan waktu di masa depan (startTime > now)
- Submit attendance → expect error "Session is not currently active"

---

## Tips
- **Token expire cepat (30s)** → untuk testing, ambil token baru setiap kali mau submit.
- **Lokasi harus dekat** → gunakan koordinat yang sama dengan session saat testing.
- **Authorize per role** → switch token dosen/mahasiswa sesuai endpoint yang ditest.
- **Gunakan Swagger UI** lebih mudah daripada curl manual.

---

## Role Summary
- **Dosen (committee/admin):**
  - Buat session (POST /sessions)
  - Generate QR (GET /sessions/{id}/qr)
  - Lihat attendance list (GET /attendance/session/{sessionId})
  - Lihat stats session (GET /attendance/stats/session/{sessionId})

- **Mahasiswa (participant):**
  - Lihat session aktif (GET /sessions)
  - Submit attendance (POST /attendance/submit)
  - Lihat riwayat sendiri (GET /attendance/user)
  - Lihat stats sendiri (GET /attendance/stats/user)
