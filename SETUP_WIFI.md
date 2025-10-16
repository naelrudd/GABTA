# 📱 SETUP WIFI UNTUK PRESENSI HP

## Pilihan 1: WiFi Kampus (PALING MUDAH)

### Langkah Setup:

1. **Connect Laptop ke WiFi Kampus**
   - Connect ke: UMM-Student / FTMM-Wifi / WiFi kampus apa aja
   
2. **Cek IP Laptop**
   ```powershell
   ipconfig
   ```
   Cari baris:
   ```
   Wireless LAN adapter Wi-Fi:
      IPv4 Address. . . . . . . . . : 192.168.18.8
   ```
   Copy IP ini!

3. **Update file server/.env**
   ```env
   SERVER_URL=http://192.168.18.8:5000
   WEB_URL=http://192.168.18.8:3001
   ```
   **⚠️ Ganti IP sesuai IP laptop kamu!**

4. **Restart Backend Server**
   ```powershell
   # Tutup terminal backend yang lama (Ctrl+C)
   cd D:\GABTA\server
   npm run dev
   ```

5. **Cek Frontend Masih Jalan**
   ```powershell
   # Jika belum jalan:
   cd D:\GABTA\web
   $env:PORT="3001"
   npm start
   ```

6. **Test dari Laptop**
   Buka browser: `http://192.168.18.8:3001`
   
   ✅ Jika bisa akses → Server siap!

7. **Test dari HP**
   - HP connect WiFi **yang sama** dengan laptop
   - Buka browser HP: `http://192.168.18.8:3001`
   - ✅ Jika bisa akses → Siap presensi!

---

## Pilihan 2: Hotspot Laptop (FULL CONTROL)

### Langkah Setup:

1. **Buat Hotspot Windows**
   - Buka: Settings → Network & Internet
   - Klik: Mobile hotspot
   - Toggle: **ON**
   - Set nama WiFi: `GABTA-Presensi`
   - Set password: `gabta2024`

2. **Cek IP Hotspot**
   ```powershell
   ipconfig
   ```
   Cari baris yang ada "Local Area Connection*" atau yang baru muncul setelah hotspot ON:
   ```
   Wireless LAN adapter Local Area Connection* 2:
      IPv4 Address. . . . . . . . . : 192.168.137.1
   ```
   Biasanya: **192.168.137.1**

3. **Update file server/.env**
   ```env
   SERVER_URL=http://192.168.137.1:5000
   WEB_URL=http://192.168.137.1:3001
   ```

4. **Restart Backend**
   ```powershell
   cd D:\GABTA\server
   npm run dev
   ```

5. **Pastikan Frontend Jalan**
   ```powershell
   cd D:\GABTA\web
   $env:PORT="3001"
   npm start
   ```

6. **Test dari Laptop**
   Browser: `http://192.168.137.1:3001`

7. **Mahasiswa Connect**
   - HP connect ke WiFi: `GABTA-Presensi`
   - Password: `gabta2024`
   - Browser HP: `http://192.168.137.1:3001`

---

## Troubleshooting

### "This site can't be reached" di HP

**Cek 1: HP dan Laptop 1 WiFi?**
```
Laptop WiFi: UMM-Student
HP WiFi:     UMM-Student  ✅ SAMA!
```

**Cek 2: Firewall Windows**
```powershell
# Allow port 3001 & 5000 di firewall
# Atau matikan firewall sementara untuk testing
```

**Cek 3: Server Jalan?**
- Backend: `http://localhost:5000` → harus bisa buka dari laptop
- Frontend: `http://localhost:3001` → harus bisa buka dari laptop

**Cek 4: IP Benar?**
- Pastikan IP di `.env` sama dengan IP laptop saat ini
- Kalau laptop pindah WiFi → IP berubah → harus update `.env` lagi!

---

## Quick Commands

### Check IP:
```powershell
ipconfig | findstr "IPv4"
```

### Check Port Open:
```powershell
netstat -ano | findstr ":3001"
netstat -ano | findstr ":5000"
```

### Restart Backend:
```powershell
cd D:\GABTA\server
npm run dev
```

### Start Frontend Port 3001:
```powershell
cd D:\GABTA\web
$env:PORT="3001"
npm start
```

---

## Expected Result

### Di Laptop Browser:
```
http://localhost:3001        → ✅ Bisa akses
http://192.168.18.8:3001     → ✅ Bisa akses
```

### Di HP Browser (sama WiFi):
```
http://192.168.18.8:3001     → ✅ Bisa akses
```

### Scan QR dari HP:
```
1. Scan QR → Browser auto-buka
2. URL: http://192.168.18.8:3001/attend/session-xxx
3. Login (kalau belum) → GPS detect → Submit otomatis!
4. ✅ Done!
```

---

**🎯 Intinya: HP dan Laptop HARUS 1 WiFi yang sama!**
