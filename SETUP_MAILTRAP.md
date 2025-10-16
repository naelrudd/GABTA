# Setup Mailtrap untuk Development Email

Mailtrap adalah layanan email testing yang menangkap semua email yang dikirim aplikasi tanpa benar-benar mengirimnya ke inbox nyata. Sangat cocok untuk development dan testing.

## Langkah Setup (5 menit)

### 1. Buat Akun Mailtrap (Gratis)
- Kunjungi: https://mailtrap.io
- Klik "Sign Up" dan buat akun gratis
- Verifikasi email Anda

### 2. Dapatkan SMTP Credentials
- Login ke dashboard Mailtrap
- Pilih "Email Testing" → "Inboxes"
- Klik inbox "Demo inbox" (atau buat inbox baru)
- Di tab "SMTP Settings", pilih "Nodemailer" dari dropdown
- Copy credentials yang ditampilkan

### 3. Update file `.env` di server
```bash
# Copy .env.example ke .env jika belum
cd d:\GABTA\server
copy .env.example .env

# Edit .env dan isi dengan credentials Mailtrap:
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your_username_here      # dari Mailtrap dashboard
EMAIL_PASS=your_password_here      # dari Mailtrap dashboard
```

### 4. Restart Backend Server
```powershell
cd d:\GABTA\server
npm run dev
```

## Test Email Verification Flow

### A. Test Register + Verify Email
1. Buka web app: http://localhost:3000
2. Register user baru dengan email: `test@students.um.ac.id`
3. Check Mailtrap inbox → akan ada email "Verifikasi Email Akun GABTA Anda"
4. Klik link verifikasi di email → auto-login ke aplikasi
5. Done! User terverifikasi

### B. Test Resend Verification
1. Register user tapi jangan klik link verifikasi
2. Coba login → akan muncul error "Email belum diverifikasi"
3. Klik "Kirim ulang email verifikasi"
4. Check Mailtrap inbox → email baru muncul

## Troubleshooting

**Email tidak muncul di Mailtrap?**
- Pastikan credentials benar (username & password)
- Check backend console untuk error log
- Restart backend server setelah update `.env`

**"Invalid login" error dari Mailtrap?**
- Re-generate password di Mailtrap dashboard
- Copy ulang credentials dan update `.env`

**Email muncul tapi link tidak bekerja?**
- Pastikan `FRONTEND_URL` di `.env` sesuai port web app (biasanya http://localhost:3000)
- Check token tidak expired (valid 24 jam)

## Production (Gmail)

Untuk production, gunakan Gmail dengan App Password:
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
```

Cara buat Gmail App Password:
1. Enable 2FA di Google Account
2. Kunjungi: https://myaccount.google.com/apppasswords
3. Generate password untuk "Mail"
4. Copy 16-character password ke `.env`
