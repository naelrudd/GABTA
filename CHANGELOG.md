# GABTA - Change Log

## Version 2.0.0 - October 16, 2025

### 🎉 Major Features Added

#### 1. NIP/NIM Selection System
- **What:** Pemisahan identitas Dosen (NIP) dan Mahasiswa (NIM)
- **Why:** Memudahkan sortir dan identifikasi user berdasarkan role
- **How:**
  - Added `nip` column to users table
  - Register form with radio button selection (NIM/NIP)
  - Auto-detect email domain (@students.um.ac.id → NIM)
  - Validation: Unique constraint, required based on selection
  - Display throughout system (Profile, SessionDetails, ClassManagement)

**Files Changed:**
- `server/src/migrations/20251015201736-add-nip-and-email-verification.js`
- `server/src/models/User.js`
- `server/src/controllers/auth.controller.js`
- `web/src/pages/Register.js`
- `web/src/pages/Profile.js`

#### 2. Email Verification System
- **What:** Verifikasi email wajib sebelum user bisa login
- **Why:** Keamanan dan validasi kepemilikan email
- **How:**
  - Email service dengan nodemailer
  - Verification token dengan expiry 24 jam
  - Auto-send verification email setelah register
  - Auto-login setelah verification berhasil
  - Resend verification feature
  - Welcome email setelah verification

**Files Changed:**
- `server/src/migrations/20251015201736-add-nip-and-email-verification.js`
- `server/src/models/User.js`
- `server/src/services/email.service.js` (NEW)
- `server/src/controllers/auth.controller.js`
- `server/src/routes/auth.routes.js`
- `web/src/pages/VerifyEmail.js` (NEW)
- `web/src/pages/ResendVerification.js` (NEW)
- `web/src/pages/Login.js`
- `web/src/App.js`

### 📊 Database Changes

**New Columns in `users` table:**
- `nip` VARCHAR(20) UNIQUE - For lecturer identification
- `is_verified` BOOLEAN DEFAULT false - Email verification status
- `verification_token` VARCHAR - Token for email verification
- `verification_expires` TIMESTAMP - Token expiry time

**Migration File:**
`20251015201736-add-nip-and-email-verification.js`

### 🔐 API Changes

**New Endpoints:**
```
GET  /auth/verify-email?token=<token>        - Verify email with token
POST /auth/resend-verification               - Resend verification email
```

**Updated Endpoints:**
```
POST /auth/register                          - Now requires idType and nim/nip
POST /auth/login                             - Now checks isVerified status
GET  /auth/profile                           - Now returns nip and isVerified
PUT  /auth/profile                           - Now returns nip
```

### 🎨 UI/UX Changes

**Register Page:**
- Radio buttons for NIM/NIP selection
- Auto-disable selection if student email detected
- Conditional display of NIM or NIP field
- Success message mentions email verification
- Auto-redirect to login after 3 seconds

**New Pages:**
1. **VerifyEmail** (`/verify-email?token=...`)
   - Loading spinner during verification
   - Success screen with auto-login
   - Error screen with resend link
   - Auto-redirect to profile after verification

2. **ResendVerification** (`/resend-verification`)
   - Simple form with email input
   - Success/error feedback
   - Link back to login

**Login Page:**
- Warning alert if email not verified
- Link to resend verification

**Profile Page:**
- Display NIP badge if user is dosen

### 📧 Email Templates

**Verification Email:**
- Subject: "Verifikasi Email Akun GABTA Anda"
- Content: Welcome message, verification button, expiry warning
- Design: Bootstrap-styled HTML template
- Variables: firstName, lastName, nim/nip, role, verification URL

**Welcome Email:**
- Subject: "Selamat Datang di GABTA!"
- Content: Success message, feature list based on role
- Design: Bootstrap-styled HTML template
- Sent after successful verification

### 🛠️ Technical Implementation

**Dependencies Added:**
```json
{
  "nodemailer": "^6.9.x"
}
```

**Environment Variables Required:**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
FRONTEND_URL=http://localhost:3000
```

### 📝 Documentation Updates

**Updated Files:**
- `README.MD` - Added email verification setup, updated tech stack
- `IMPLEMENTATION_SUMMARY.md` - Added features 6 & 7, email templates, testing checklist
- `.env.example` - Added email configuration template

### 🔄 Flow Changes

**Old Registration Flow:**
```
Register → Create User → Login
```

**New Registration Flow:**
```
Register → Create User (unverified) → Send Verification Email → 
User Clicks Link → Verify Email → Auto-Login → Redirect to Profile
```

**Login Flow Update:**
```
Enter Credentials → Check Password → Check isVerified →
If not verified: Show error + resend link
If verified: Generate token → Login success
```

### ⚙️ Configuration

**Email Service Setup:**

Option 1: Gmail (Production)
1. Enable 2FA on Gmail
2. Generate App Password
3. Update EMAIL_USER and EMAIL_PASS in .env

Option 2: Mailtrap (Development)
1. Sign up at mailtrap.io
2. Get SMTP credentials
3. Update EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS

Option 3: Console Logging (Testing)
- Modify email.service.js to log links
- No email actually sent

### 🐛 Bug Fixes

- Fixed auto-role assignment for student emails
- Added proper error handling for email sending failures
- Improved validation for NIM/NIP uniqueness
- Added checks for expired verification tokens

### 🔒 Security Improvements

- Email verification prevents fake registrations
- Token expiry (24 hours) for verification links
- Unique constraint on NIM and NIP
- Login blocked until email verified
- Verification tokens are cryptographically secure (32 bytes)

### 📈 Database Migrations Status

```
✅ 20251015000001-create-roles.js
✅ 20251015000002-create-users.js
✅ 20251015000003-create-sessions.js
✅ 20251015000004-create-attendance-records.js
✅ 20251015194310-add-kode-kelas-to-sessions.js
✅ 20251015200428-add-nim-and-capacity-fields.js
✅ 20251015201736-add-nip-and-email-verification.js ← NEW
```

### 🧪 Testing Checklist

- [ ] Register with NIM (mahasiswa)
- [ ] Register with NIP (dosen)
- [ ] Auto-detect student email
- [ ] Receive verification email
- [ ] Click verification link
- [ ] Auto-login after verification
- [ ] Try login before verification (should fail)
- [ ] Resend verification email
- [ ] Check expired token handling
- [ ] Verify NIM/NIP shown in Profile
- [ ] Verify NIM/NIP shown in SessionDetails
- [ ] Verify NIP/NIM in Excel export

### 📦 Files Summary

**Created (7 files):**
- `server/src/services/email.service.js`
- `server/src/migrations/20251015201736-add-nip-and-email-verification.js`
- `server/.env.example`
- `web/src/pages/VerifyEmail.js`
- `web/src/pages/ResendVerification.js`
- `CHANGELOG.md`
- Various documentation updates

**Modified (10+ files):**
- `server/src/models/User.js`
- `server/src/controllers/auth.controller.js`
- `server/src/routes/auth.routes.js`
- `web/src/pages/Register.js`
- `web/src/pages/Login.js`
- `web/src/pages/Profile.js`
- `web/src/App.js`
- `README.MD`
- `IMPLEMENTATION_SUMMARY.md`

### 🚀 Deployment Notes

1. Run migration: `npx sequelize-cli db:migrate`
2. Configure email service in .env
3. Test email sending with Mailtrap first
4. Update FRONTEND_URL in production
5. Verify email templates render correctly
6. Test complete registration flow
7. Monitor email sending logs

### 🔮 Future Enhancements

- [ ] Email verification reminder after 24 hours
- [ ] Ability to change email (requires re-verification)
- [ ] Admin panel to manually verify users
- [ ] Email templates customization
- [ ] SMS verification as alternative
- [ ] Social login (Google, Microsoft)
- [ ] Two-factor authentication (2FA)
- [ ] Password reset via email

---

## Previous Versions

### Version 1.0.0 - October 15, 2025
- Initial release with basic attendance system
- QR Code generation and scanning
- GPS-based location validation
- Session management
- Dashboard and reporting
- NIM field for students
- Class management with capacity
- Excel export functionality

---

*For detailed feature implementation, see IMPLEMENTATION_SUMMARY.md*
*For setup instructions, see README.MD*
