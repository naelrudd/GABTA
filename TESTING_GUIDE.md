# 🧪 GABTA - Complete Testing Guide

## Test All Features End-to-End

This guide walks you through testing every feature of the GABTA system.

---

## 🎯 Test Scenario 1: Complete Attendance Flow (Web → Mobile)

### Setup (5 minutes):

1. **Start Backend**:
```powershell
cd d:\GABTA\server
npm run dev
```
✓ Server running on http://localhost:5000

2. **Start Web App** (new terminal):
```powershell
cd d:\GABTA\web
npm start
```
✓ Opens http://localhost:3000 automatically

3. **Start Mobile App** (new terminal):
```powershell
cd d:\GABTA\mobile
npm run android
```
✓ App installs on emulator/device

---

## 📝 Phase 1: Create Session (Web - Dosen)

### Step 1: Login as Dosen
1. Open http://localhost:3000
2. Login:
   - Email: `admin@gabta.com`
   - Password: `admin123`
3. ✓ Should redirect to Dashboard

### Step 2: Create New Session
1. Click **"Create Session"** button
2. Fill form:
   - **Name**: "Testing Mobile QR Flow"
   - **Description**: "Testing complete attendance system"
   - **Class Name**: 
     - If new: Type "Mobile Testing 101"
     - If existing: Select from dropdown
   - **Radius**: Drag slider to **500m** (for easier testing)
   - **Start Time**: Click "Now + 2 hours" button
   - **End Time**: Auto-filled (2 hours duration)
   - **Location**: 
     - Click "📍 Get Current Location" button
     - OR manually enter: `-6.200000, 106.816666`
3. Click **"Create Session"**
4. ✓ Success message appears
5. ✓ Redirected to Dashboard

### Step 3: View QR Code
1. On Dashboard, find "Mobile Testing 101" accordion section
2. Should see:
   - ✓ Section header with "Mobile Testing 101"
   - ✓ Green badge showing "1 active" (if session is active)
3. Find your session "Testing Mobile QR Flow"
4. Click **"View Details"** button
5. ✓ QR Code is displayed
6. ✓ See countdown timer: "QR refreshes in 30 seconds"
7. ✓ See 6-digit manual code (e.g., "123456")
8. ✓ Session info shows:
   - Class: "Mobile Testing 101"
   - Radius: 500m
   - Location coordinates
   - 0 attendees (initially)

**Keep this browser tab open** - you'll need the QR code for mobile testing.

---

## 📱 Phase 2: Submit Attendance (Mobile - Mahasiswa)

### Step 4: Login on Mobile
1. On mobile app, login:
   - Email: `mahasiswa@gabta.com`
   - Password: `mahasiswa123`
2. ✓ Should see Sessions List screen

### Step 5: Find Session
1. Look for "🎓 Mobile Testing 101" section
2. ✓ Should see green badge "1 active"
3. Find session "Testing Mobile QR Flow"
4. ✓ Should see:
   - Session name
   - Start time
   - Radius: 500m
   - Green "ACTIVE" badge
   - Two buttons: "📷 Scan QR" and "📝 Manual Entry"

### Step 6A: Test QR Scanning

1. Tap **"📷 Scan QR"** button
2. **If prompted for camera permission**:
   - Tap "Allow" or "While using the app"
3. ✓ Camera should open with green QR frame marker
4. Point camera at QR code on computer screen
5. ✓ QR automatically detected
6. ✓ Navigate to "Submit Attendance" screen
7. ✓ Session ID and Token fields are pre-filled
8. ✓ Session info card shows:
   - Name: "Testing Mobile QR Flow"
   - Class: "Mobile Testing 101"
   - Radius: 500m
   - Session location coordinates

### Step 6B: Alternative - Manual Entry (skip if QR worked)

1. Instead of "Scan QR", tap **"📝 Manual Entry"**
2. On submit screen:
   - Session ID: Auto-filled from selected session
   - Token: Enter 6-digit code from web QR display
3. Continue to Step 7

### Step 7: Location Permission & Submission

1. **If prompted for location permission**:
   - Tap "Allow" or "While using the app"
2. Wait for location to be acquired
3. ✓ Should see green checkmarks:
   - ✓ Lat: -x.xxxxxx
   - ✓ Long: xxx.xxxxxx
4. **If location not working**:
   - Tap "🔄 Refresh" button
   - **For emulator**: Send mock location via Android Studio
     - Extended Controls (...) → Location tab
     - Enter: Lat `-6.200000`, Long `106.816666`
     - Click "Send"
5. ✓ Submit button should be **enabled** (green)
6. Tap **"📝 Submit Attendance"**
7. ✓ See success alert: "Your attendance has been recorded successfully"
8. Tap "OK"
9. ✓ Navigate back to Sessions List

### Step 8: Verify in Profile

1. Tap **"Profile"** tab at bottom
2. ✓ Overall stats updated:
   - Total Sesi: 1
   - Hadir: 1 (green)
3. Scroll to "📊 Statistik Per Kelas"
4. ✓ Should see:
   - Mobile Testing 101
   - Total: 1, Hadir: 1
   - Green badge: 100%
5. Scroll to "📋 Riwayat Kehadiran"
6. ✓ Should see section: "🎓 Mobile Testing 101"
7. ✓ Should see record:
   - Session: "Testing Mobile QR Flow"
   - Timestamp: (current time)
   - Status: Green badge "Hadir"

---

## 🌐 Phase 3: Verify on Web (Dosen)

### Step 9: Check Attendee List

1. Return to web browser (Session Details page)
2. Refresh page (F5) if needed
3. ✓ Attendee count updated: "👥 1 Attendee(s)"
4. Scroll to "Attendee List" table
5. ✓ Should see new row:
   - Name: (Mahasiswa name from seed data)
   - NIM: (Mahasiswa NIM)
   - Status: Green "Hadir"
   - Timestamp: (just now)

### Step 10: Dashboard Verification

1. Click "Dashboard" in navbar
2. Find "Mobile Testing 101" section
3. ✓ Session should still show green "Active" badge
4. ✓ Can create more sessions in same class
5. ✓ Accordion groups multiple sessions together

---

## 🧪 Test Scenario 2: Error Handling

### Test 2A: Invalid Token

1. **Mobile**: Go to Sessions List
2. Tap "📝 Manual Entry" on active session
3. Enter invalid token: `999999`
4. Ensure location is acquired
5. Tap "Submit"
6. ✓ Should see error: "Invalid token" or "Token expired"

### Test 2B: Expired Token

1. **Web**: View session QR code
2. Wait 30 seconds (watch countdown)
3. ✓ QR refreshes automatically
4. **Mobile**: Try to submit with OLD token
5. ✓ Should see error: "Token expired"

### Test 2C: Outside Radius

1. **Web**: Create session with small radius (50m)
2. Use location: `-6.200000, 106.816666`
3. **Mobile (Emulator)**: Send different location:
   - Lat: `-6.300000`, Long: `106.816666` (far away)
4. Try to submit attendance
5. ✓ Should see error: "You are outside the attendance radius"

### Test 2D: Duplicate Submission

1. Successfully submit attendance for a session
2. Try to submit again for same session
3. ✓ Should see error: "You have already submitted attendance"

### Test 2E: Session Not Active

1. **Web**: Create session with start time in future
2. **Mobile**: Try to tap "Scan QR" or "Manual Entry"
3. ✓ Should see alert: "Session Not Active"
4. ✓ Buttons should not be visible (only on active sessions)

### Test 2F: Session Ended

1. Wait for session to end (or edit end time in DB)
2. **Mobile**: Refresh sessions list (pull down)
3. ✓ Session should show gray "Ended" badge
4. ✓ No action buttons visible
5. Try to submit attendance
6. ✓ Should see error: "Session not active"

---

## 🎨 Test Scenario 3: UI Features

### Test 3A: Pull to Refresh

1. **Mobile - Sessions List**:
   - Pull down from top of screen
   - ✓ Loading spinner appears
   - ✓ List refreshes
2. **Mobile - Profile**:
   - Pull down on profile screen
   - ✓ Stats and history refresh

### Test 3B: Class Grouping

1. **Web - Dashboard**:
   - Create 3 sessions in "Class A"
   - Create 2 sessions in "Class B"
   - Create 1 session without class name
   - ✓ Accordion shows 3 groups:
     - Class A (3 sessions)
     - Class B (2 sessions)
     - Tanpa Kelas (1 session)
   - ✓ Each section has collapse/expand
   - ✓ Active count badges correct

2. **Mobile - Sessions List**:
   - ✓ Same grouping visible
   - ✓ Active count badges on each group

### Test 3C: QR Auto-Refresh

1. **Web - Session Details**:
   - Watch countdown timer
   - ✓ Counts down from 30 to 0
   - ✓ QR code image refreshes
   - ✓ Manual code changes
   - ✓ Countdown resets to 30

### Test 3D: Radius Slider

1. **Web - Create Session**:
   - Drag radius slider
   - ✓ Badge shows current value (10m - 1000m)
   - ✓ Increments by 10m
   - ✓ Can type exact value in field

### Test 3E: Class Selector

1. **Web - Create Session**:
   - If saved classes exist:
     - ✓ Dropdown shows saved classes
     - ✓ "+ Add New Class" option visible
   - Select "+ Add New Class":
     - ✓ Dropdown changes to text input
     - ✓ Can type new class name
   - On submit:
     - ✓ New class saved to localStorage
     - ✓ Available in dropdown for next session

---

## 📊 Test Scenario 4: Multi-Class Features

### Test 4A: Multiple Classes Enrollment

1. **Web**: Create 3 sessions in different classes:
   - "Math 101" (today, active)
   - "Physics 202" (today, active)
   - "CS 303" (tomorrow, upcoming)
2. **Mobile**: Submit attendance for "Math 101" and "Physics 202"
3. **Mobile - Profile**:
   - ✓ Stats show Total: 2, Hadir: 2
   - ✓ "Statistik Per Kelas" shows:
     - Math 101: Total 1, Hadir 1, 100%
     - Physics 202: Total 1, Hadir 1, 100%
   - ✓ "Riwayat Kehadiran" grouped:
     - Math 101 section (1 record)
     - Physics 202 section (1 record)

### Test 4B: Performance Percentage

1. **Web**: Create 10 sessions in "Test Class"
2. **Mobile**: Submit attendance for 7 sessions (Hadir)
3. **Mobile - Profile**:
   - ✓ Test Class shows:
     - Total: 7, Hadir: 7
     - Green badge: 100%
4. **Web**: Mark 3 as "absent" manually in DB
5. **Mobile - Profile** (refresh):
   - ✓ Test Class shows:
     - Total: 10, Hadir: 7, Absen: 3
     - Orange badge: 70%

---

## 🔐 Test Scenario 5: Permission Flows

### Test 5A: Camera Permission - First Time

1. Fresh install or clear app data
2. Tap "Scan QR"
3. ✓ Permission dialog appears
4. Test **Deny**:
   - ✓ Shows "Camera permission required" screen
   - ✓ "Grant Permission" button visible
   - ✓ "Enter Code Manually" fallback available
5. Tap "Grant Permission"
6. ✓ Permission dialog appears again
7. Tap **Allow**
8. ✓ Camera opens successfully

### Test 5B: Camera Permission - Blocked

1. Deny camera permission
2. Deny again (becomes "Don't ask again")
3. Try to scan QR
4. ✓ Shows "Camera permission required"
5. Tap "Open Settings"
6. ✓ Opens app settings
7. Enable camera permission
8. Return to app
9. Try scan QR again
10. ✓ Camera works now

### Test 5C: Location Permission Flow

1. Fresh install or clear app data
2. Go to attendance submit screen
3. ✓ Permission dialog appears automatically
4. Test **Deny**:
   - ✓ Shows "Location not available"
   - ✓ Cannot submit (button disabled)
   - ✓ Refresh button available
5. Tap "Refresh"
6. ✓ Permission dialog appears
7. Tap **Allow**
8. ✓ Location acquired
9. ✓ Submit button enabled

---

## 🌐 Test Scenario 6: Network Conditions

### Test 6A: No Internet Connection

1. **Mobile**: Disable WiFi and mobile data
2. Try to load sessions list
3. ✓ Shows error: "Network Error"
4. Re-enable internet
5. Pull to refresh
6. ✓ Sessions load successfully

### Test 6B: Server Offline

1. Stop backend server (`Ctrl+C` in server terminal)
2. **Mobile**: Try to submit attendance
3. ✓ Shows error: "Failed to submit" or "Network Error"
4. Restart server: `npm run dev`
5. Try again
6. ✓ Submission succeeds

### Test 6C: Slow Connection

1. **Android Studio Emulator**: 
   - Extended Controls → Network tab
   - Set to "EDGE" (slow 2G)
2. **Mobile**: Try to load sessions
3. ✓ Loading spinner shows longer
4. ✓ Eventually loads (or shows timeout error)
5. Reset to "Full" speed

---

## ✅ Test Checklist Summary

### Backend (Server) ✓
- [x] Migrations run successfully
- [x] Seeds create admin/mahasiswa users
- [x] API responds on port 5000
- [x] JWT authentication works
- [x] Session CRUD operations
- [x] Attendance submission with validation
- [x] Distance calculation (Haversine)
- [x] Token generation/validation (30s expiry)

### Web Application ✓
- [x] Login with dosen/mahasiswa
- [x] Create session with class name
- [x] Create session with custom radius
- [x] Dashboard groups by class
- [x] QR auto-refresh every 30s
- [x] Session details show attendees
- [x] Accordion UI for class grouping
- [x] Radius slider (10-1000m)
- [x] Class selector with localStorage
- [x] GPS location button

### Mobile Application ✓
- [x] Login screen works
- [x] Sessions list grouped by class
- [x] Real-time session status (Active/Upcoming/Ended)
- [x] QR scanner with camera
- [x] Camera permission handling
- [x] Manual entry fallback
- [x] GPS location tracking
- [x] Location permission handling
- [x] Attendance submission
- [x] Success/error feedback
- [x] Profile with overall stats
- [x] Stats per class
- [x] Attendance history grouped by class
- [x] Percentage calculations
- [x] Pull to refresh
- [x] Bottom tab navigation

### Error Handling ✓
- [x] Invalid token error
- [x] Expired token error
- [x] Outside radius error
- [x] Duplicate submission error
- [x] Session not active error
- [x] Network error handling
- [x] Permission denied handling

### UI/UX Features ✓
- [x] Loading spinners
- [x] Empty states
- [x] Status badges (color-coded)
- [x] Action buttons (conditional)
- [x] Alert messages
- [x] Card layouts with shadows
- [x] Accordion grouping
- [x] Pull to refresh
- [x] Countdown timers
- [x] Material Design icons

---

## 🎯 Production Readiness Checklist

Before deploying to real users:

### Backend
- [ ] Update `.env` with production database
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS
- [ ] Set up CORS for production domains
- [ ] Configure rate limiting
- [ ] Set up logging (Winston/Morgan)
- [ ] Set up monitoring (PM2/New Relic)
- [ ] Database backups configured
- [ ] Review security middleware

### Web
- [ ] Update API_URL to production backend
- [ ] Run `npm run build`
- [ ] Deploy to hosting (Netlify/Vercel/etc)
- [ ] Configure production domain
- [ ] Enable HTTPS
- [ ] Set up analytics (Google Analytics)
- [ ] Error tracking (Sentry)

### Mobile
- [ ] Update API baseURL to production
- [ ] Test on multiple devices
- [ ] Generate signed APK
- [ ] Prepare app store assets:
  - [ ] App icon
  - [ ] Screenshots
  - [ ] Feature graphic
  - [ ] Description
  - [ ] Privacy policy
- [ ] Submit to Google Play Store
- [ ] Set up crash reporting (Firebase)

### Documentation
- [ ] User manual (PDF/video)
- [ ] Admin guide
- [ ] FAQ document
- [ ] Support contact info
- [ ] Privacy policy
- [ ] Terms of service

---

## 🎉 Testing Complete!

If all scenarios pass ✅, your GABTA system is fully functional and ready for production deployment!

**Next Steps:**
1. Train users (dosen and mahasiswa)
2. Monitor first week of usage
3. Collect feedback
4. Iterate on UX improvements
5. Add analytics for usage patterns

**Support:**
- Check logs: `server/logs/` (if configured)
- Mobile logs: `adb logcat | grep -i react`
- Web console: Browser DevTools → Console tab
