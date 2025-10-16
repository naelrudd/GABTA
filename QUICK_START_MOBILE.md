# 🚀 GABTA Mobile - Quick Start Guide

## ⚡ Fastest Way to Run the Mobile App

Since your project already has the React Native structure, follow these simple steps:

---

## 📋 Prerequisites (One-Time Setup)

### 1. Install Required Software (if not already installed):

**Node.js & npm** (v14+):
```powershell
node --version  # Check if installed
npm --version
```
Download from: https://nodejs.org

**Java JDK 11**:
```powershell
java -version  # Check if installed
```
Download from: https://www.oracle.com/java/technologies/javase-jdk11-downloads.html

**Android Studio**:
- Download: https://developer.android.com/studio
- During installation, ensure these are checked:
  - ✅ Android SDK
  - ✅ Android SDK Platform
  - ✅ Android Virtual Device

**React Native CLI**:
```powershell
npm install -g react-native-cli
```

### 2. Configure Environment Variables:

Add to your System Environment Variables:

```
ANDROID_HOME = C:\Users\YourUsername\AppData\Local\Android\Sdk
```

Add to PATH:
```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\emulator
%ANDROID_HOME%\tools
%ANDROID_HOME%\tools\bin
```

To verify:
```powershell
adb version  # Should show Android Debug Bridge version
```

---

## 🏃 Running the App (3 Steps)

### Step 1: Install Mobile Dependencies

```powershell
cd d:\GABTA\mobile
npm install
```

### Step 2: Start Backend Server

Open a **NEW PowerShell terminal**:

```powershell
cd d:\GABTA\server
npm run dev
```

Keep this running. You should see:
```
Server is running on http://localhost:5000
```

### Step 3: Run Mobile App

#### Option A: Using Android Emulator (Recommended for Testing)

1. **Open Android Studio** → Tools → Device Manager
2. **Create AVD** (if you don't have one):
   - Click "+ Create Device"
   - Select "Pixel 5" or any phone
   - Select System Image: "R" (API Level 30) or higher
   - Click Finish

3. **Start Emulator**:
   - In Device Manager, click ▶️ Play button on your AVD

4. **Run the app** in a **NEW PowerShell terminal**:
```powershell
cd d:\GABTA\mobile
npm run android
```

The app will build and install automatically on the emulator.

#### Option B: Using Physical Android Device

1. **Enable Developer Mode** on your phone:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - Go back to Settings → System → Developer Options
   - Enable "USB Debugging"

2. **Connect phone via USB** and allow USB debugging when prompted

3. **Verify connection**:
```powershell
adb devices
```
You should see your device listed.

4. **Update API endpoint** (IMPORTANT for physical device):

Edit `d:\GABTA\mobile\src\services\api.js`:

```javascript
// Change from:
const baseURL = 'http://10.0.2.2:5000/api';

// To (use your PC's IP address):
const baseURL = 'http://192.168.1.100:5000/api';  // Replace with YOUR IP
```

To find your IP:
```powershell
ipconfig
```
Look for "IPv4 Address" under your WiFi adapter (e.g., 192.168.1.100)

5. **Run the app**:
```powershell
cd d:\GABTA\mobile
npm run android
```

---

## 🎮 Using the App

### 1. Login

Use test credentials:
- **Email**: `mahasiswa@gabta.com`
- **Password**: `mahasiswa123`

### 2. Grant Permissions

When prompted, allow:
- ✅ Camera (for QR scanning)
- ✅ Location (for attendance validation)

### 3. View Sessions

- You'll see sessions grouped by class
- Active sessions show in green with "ACTIVE" badge
- Two buttons appear for active sessions:
  - **📷 Scan QR**: Opens camera
  - **📝 Manual Entry**: Enter codes manually

### 4. Submit Attendance

#### Method 1: QR Code (Recommended)

1. Open web interface: http://localhost:3000
2. Login as dosen: `admin@gabta.com` / `admin123`
3. Go to "Dashboard" → Click on a session
4. QR code is displayed on screen
5. On mobile app, tap "📷 Scan QR"
6. Point camera at QR code
7. App auto-fills session ID and token
8. Wait for location to be acquired (green ✓)
9. Tap "📝 Submit Attendance"

#### Method 2: Manual Entry

1. Tap "📝 Manual Entry" on a session
2. Session ID is pre-filled
3. Enter 6-digit token (get from web QR display)
4. Wait for location
5. Tap "📝 Submit Attendance"

### 5. View Profile

- Tap "Profile" tab at bottom
- See your attendance statistics
- View attendance history grouped by class

---

## 🐛 Common Issues & Quick Fixes

### Issue: "Unable to load script from assets"

**Fix**:
```powershell
# In mobile folder, run:
npm start -- --reset-cache

# Then in another terminal:
npm run android
```

### Issue: "Network Error" or "Cannot connect to server"

**For Emulator**:
- Ensure backend is running on port 5000
- Use `http://10.0.2.2:5000/api` in api.js
- Restart emulator if needed

**For Physical Device**:
- Ensure phone and PC are on same WiFi
- Update api.js with your PC's IP (from `ipconfig`)
- Test in phone browser: `http://YOUR_PC_IP:5000`
- Check Windows Firewall isn't blocking port 5000

### Issue: "Build Failed" or Gradle errors

**Fix**:
```powershell
cd d:\GABTA\mobile\android
.\gradlew clean
cd ..
npm run android
```

### Issue: Camera not working

**Fix**:
- Uninstall app from device/emulator
- Grant camera permission when prompted
- If still not working: Settings → Apps → GABTA → Permissions → Enable Camera

### Issue: Location not found

**Fix**:
- Enable GPS on device
- Grant location permission
- For emulator: Use Android Studio to send mock location
  - Extended Controls (... button) → Location tab
  - Enter coordinates: `-6.200000, 106.816666`
  - Click "Send"

### Issue: "Session Not Active" error

**Fix**:
- Check session start/end time in web interface
- Ensure current time is within session duration
- Pull down to refresh sessions list

### Issue: "Outside Radius" error

**Fix**:
- Increase session radius to 500m or 1000m for testing
- Or set session location to match your current location
- For emulator: Send location matching session coordinates

---

## 📸 Testing QR Code Flow (Complete Example)

### Setup Test Session:

1. **Start backend**:
```powershell
cd d:\GABTA\server
npm run dev
```

2. **Open web interface**: http://localhost:3000

3. **Login as Dosen**:
   - Email: `admin@gabta.com`
   - Password: `admin123`

4. **Create Session**:
   - Click "Create Session"
   - Name: "Test Attendance"
   - Class: "Mobile Testing"
   - Radius: 500 (meters)
   - Start Time: Current time + 5 minutes
   - Duration: 2 hours
   - Location: Click "Get Current Location" or use dummy:
     - Latitude: -6.200000
     - Longitude: 106.816666
   - Click "Create Session"

5. **View QR Code**:
   - Go to Dashboard
   - Find your session under "Mobile Testing"
   - Click "View Details"
   - QR code is displayed with 30-second countdown

### Test on Mobile:

1. **Start mobile app** (if not running):
```powershell
cd d:\GABTA\mobile
npm run android
```

2. **Login as Mahasiswa**:
   - Email: `mahasiswa@gabta.com`
   - Password: `mahasiswa123`

3. **Navigate to Sessions**:
   - You should see "Mobile Testing" class
   - "Test Attendance" session with green "ACTIVE" badge

4. **Scan QR Code**:
   - Tap "📷 Scan QR" button
   - Grant camera permission if prompted
   - Point camera at QR code on computer screen
   - App should auto-detect and navigate to submit screen

5. **Submit Attendance**:
   - Session ID and Token are pre-filled
   - Wait for location (green checkmarks appear)
   - For emulator: Send location via Android Studio
   - Tap "📝 Submit Attendance"
   - Success message appears!

6. **Verify in Profile**:
   - Tap "Profile" tab
   - See updated stats
   - "Test Attendance" appears in history under "Mobile Testing"

---

## 🎯 Production Checklist

Before deploying to real users:

- [ ] Update API endpoint to production server
- [ ] Generate signed APK for release
- [ ] Test on multiple device models
- [ ] Test different network conditions (WiFi, 4G)
- [ ] Test permission flows (deny then allow)
- [ ] Test with expired/invalid tokens
- [ ] Test outside session radius
- [ ] Test with GPS disabled
- [ ] Test session expired scenarios
- [ ] Document user training materials

---

## 📁 Key Files You Created

All mobile screens are ready:

- ✅ **SessionsListScreen.js** - Shows sessions grouped by class
- ✅ **QRScannerScreen.js** - Camera-based QR scanner
- ✅ **AttendanceSubmitScreen.js** - Submit form with geolocation
- ✅ **ProfileScreen.js** - User profile with stats per class
- ✅ **MainNavigator.js** - Bottom tab navigation
- ✅ **api.js** - API configuration (UPDATE IP for device testing)

---

## 🎉 You're All Set!

The mobile app is fully implemented with:
- ✅ QR Code scanning with camera
- ✅ Manual token entry fallback
- ✅ GPS-based location validation
- ✅ Session grouping by class
- ✅ Real-time session status
- ✅ Attendance history per class
- ✅ Permission handling (camera, location)
- ✅ Error handling and user feedback

**Next**: Run the 3-step setup above and start testing! 🚀
