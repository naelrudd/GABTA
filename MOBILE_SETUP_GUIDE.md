# GABTA Mobile App - Setup & Usage Guide

## 📱 Overview
The GABTA mobile app allows students (mahasiswa) to submit attendance by scanning QR codes or entering manual tokens. It includes geolocation validation to ensure students are physically present at the session location.

## 🔧 Prerequisites

### Required Software:
- **Node.js** (v14 or higher)
- **React Native CLI** (not Expo)
- **Android Studio** (for Android development)
- **Java JDK 11** (required by React Native)
- **Android SDK** (API Level 28 or higher)

### For Physical Device Testing:
- Android phone with USB debugging enabled
- USB cable

### For Emulator Testing:
- Android Virtual Device (AVD) configured in Android Studio

---

## 📦 Installation Steps

### 1. Install Dependencies

Navigate to the mobile directory and install packages:

```bash
cd d:\GABTA\mobile
npm install
```

### 2. Configure Android Permissions

Create/Update `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
  package="com.gabtamobile">

    <!-- Required Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.VIBRATE"/>

    <!-- Camera Hardware Features -->
    <uses-feature android:name="android.hardware.camera" />
    <uses-feature android:name="android.hardware.camera.autofocus" />

    <application
      android:name=".MainApplication"
      android:label="@string/app_name"
      android:icon="@mipmap/ic_launcher"
      android:roundIcon="@mipmap/ic_launcher_round"
      android:allowBackup="false"
      android:theme="@style/AppTheme"
      android:usesCleartextTraffic="true">
      
      <activity
        android:name=".MainActivity"
        android:label="@string/app_name"
        android:configChanges="keyboard|keyboardHidden|orientation|screenSize|uiMode"
        android:launchMode="singleTask"
        android:windowSoftInputMode="adjustResize"
        android:exported="true">
        <intent-filter>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LAUNCHER" />
        </intent-filter>
      </activity>
    </application>
</manifest>
```

### 3. Link Native Dependencies

```bash
# For React Native 0.67.4, most dependencies auto-link, but camera needs manual setup
npx react-native link react-native-camera
npx react-native link react-native-vector-icons
```

### 4. Update build.gradle for Camera Support

Edit `android/app/build.gradle`:

Add inside `android { defaultConfig { ... } }`:

```gradle
missingDimensionStrategy 'react-native-camera', 'general'
```

### 5. Configure API Endpoint

The API endpoint is already configured in `src/services/api.js`:

- **For Android Emulator**: `http://10.0.2.2:5000/api` (points to localhost on your PC)
- **For Physical Device**: Update to your PC's local IP (e.g., `http://192.168.1.100:5000/api`)

To change for physical device, edit `mobile/src/services/api.js`:

```javascript
const baseURL = 'http://YOUR_PC_IP:5000/api'; // Replace YOUR_PC_IP with your local IP
```

Find your PC's IP:
- Windows: `ipconfig` (look for IPv4 Address)
- Mac/Linux: `ifconfig` or `ip addr`

---

## 🚀 Running the App

### Method 1: Android Emulator

1. **Start Android Emulator** (via Android Studio or command):
```bash
emulator -avd YOUR_AVD_NAME
```

2. **Start Backend Server** (in separate terminal):
```bash
cd d:\GABTA\server
npm run dev
```

3. **Start Metro Bundler** (in separate terminal):
```bash
cd d:\GABTA\mobile
npm start
```

4. **Run Android App** (in another terminal):
```bash
cd d:\GABTA\mobile
npm run android
```

### Method 2: Physical Android Device

1. **Enable USB Debugging** on your phone:
   - Go to Settings → About Phone → Tap "Build Number" 7 times
   - Go to Settings → Developer Options → Enable "USB Debugging"

2. **Connect phone via USB** and authorize the connection

3. **Verify device is connected**:
```bash
adb devices
```

4. **Update API endpoint** in `src/services/api.js` to your PC's local IP:
```javascript
const baseURL = 'http://192.168.1.100:5000/api'; // Use your actual IP
```

5. **Start backend server** (ensure it's accessible on your network):
```bash
cd d:\GABTA\server
npm run dev
```

6. **Run the app**:
```bash
cd d:\GABTA\mobile
npm run android
```

---

## 📱 App Features

### 1. Login Screen
- Enter email and password
- Default test account:
  - **Mahasiswa**: `mahasiswa@gabta.com` / `mahasiswa123`
  - **Dosen**: `admin@gabta.com` / `admin123`

### 2. Sessions List Screen
- View all available sessions grouped by class
- Shows session status: Active (green), Upcoming (blue), Ended (gray)
- Active sessions show action buttons:
  - **📷 Scan QR**: Opens camera to scan QR code
  - **📝 Manual Entry**: Enter session ID and 6-digit token manually

### 3. QR Scanner Screen
- **Auto-scans** QR code when in view
- **Permission handling**: Requests camera permission if not granted
- **Fallback**: "Enter Code Manually" button if QR scanning fails
- QR code must contain JSON: `{"sessionId":"xxx","token":"xxx"}`

### 4. Attendance Submit Screen
- **Auto-filled** if coming from QR scan
- **Manual input** fields:
  - Session ID
  - 6-digit token
- **Location tracking**:
  - Automatically gets GPS location
  - Shows latitude/longitude coordinates
  - Refresh button to update location
- **Validation**:
  - Checks if user is within session radius (10-500m)
  - Validates token expiration (30 seconds)
  - Verifies session is active
- **Submission**:
  - Shows success message with navigation to sessions list
  - Displays specific error messages for validation failures

### 5. Profile Screen
- **User Information**: Name, NIM/NIP, Email, Role
- **Overall Statistics**: Total sessions, Present, Late, Absent counts
- **Stats Per Class**: Breakdown of attendance by each class with percentage
- **Attendance History**: Grouped by class, showing:
  - Session name
  - Timestamp
  - Status badge (Hadir/Terlambat/Tidak Hadir)

---

## 🧪 Testing Flow

### Complete Attendance Flow Test:

1. **Start Backend Server**:
```bash
cd d:\GABTA\server
npm run dev
```

2. **Start Mobile App** (emulator or device)

3. **Login as Mahasiswa**:
   - Email: `mahasiswa@gabta.com`
   - Password: `mahasiswa123`

4. **Create a Session** (use web interface as dosen):
   - Open http://localhost:3000 in browser
   - Login as `admin@gabta.com` / `admin123`
   - Create session with:
     - Class name: "Testing Class"
     - Radius: 50m
     - Current time + 5 minutes
     - Duration: 2 hours
     - GPS location: Use your location or dummy coordinates

5. **View Session on Mobile**:
   - See "Testing Class" in Sessions List
   - Status should be "Active" (green)

6. **Submit Attendance via QR**:
   - Tap "📷 Scan QR" button
   - Grant camera permission if prompted
   - On web interface, display QR code for the session
   - Scan QR code with mobile camera
   - App auto-navigates to Submit screen with filled data

7. **Enable Location**:
   - Grant location permission if prompted
   - Wait for location to be acquired (green ✓ marks)
   - If needed, tap 🔄 Refresh button

8. **Submit**:
   - Tap "📝 Submit Attendance" button
   - See success message
   - Navigate back to Sessions List

9. **View Profile**:
   - Tap "Profile" tab at bottom
   - See updated statistics
   - Check attendance history grouped by class

### Manual Entry Test:

1. From Sessions List, tap "📝 Manual Entry" on an active session
2. Enter Session ID (from web interface URL or database)
3. Enter 6-digit token (shown on web QR code display)
4. Wait for location to be acquired
5. Submit attendance

---

## 🐛 Troubleshooting

### Issue: "Network Error" or "Connection Refused"

**Solution for Emulator**:
- Ensure backend is running on port 5000
- Use `http://10.0.2.2:5000/api` in api.js
- Check firewall isn't blocking port 5000

**Solution for Physical Device**:
- Ensure phone and PC are on same WiFi network
- Use PC's local IP (e.g., `http://192.168.1.100:5000/api`)
- Check Windows Firewall allows port 5000
- Test backend accessibility: Open `http://YOUR_PC_IP:5000/api/auth/profile` in phone browser

### Issue: Camera Permission Denied

**Solution**:
- Uninstall app: `adb uninstall com.gabtamobile`
- Reinstall: `npm run android`
- Grant permissions when prompted

### Issue: Location Not Working

**Solution**:
- Enable GPS on device
- Grant location permission in app settings
- For emulator: Send location via Android Studio (... → Location)
- Check permission in Settings → Apps → GABTA → Permissions

### Issue: QR Scanner Not Working

**Solution**:
- Ensure good lighting
- Hold phone steady
- Camera should focus on QR code
- Use "Enter Code Manually" as fallback

### Issue: "Session Not Active" Error

**Solution**:
- Check session start/end time
- Ensure current time is between session duration
- Refresh sessions list (pull down)

### Issue: "Outside Radius" Error

**Solution**:
- Check session radius setting (50m default)
- Ensure you're physically within the radius
- For testing: Increase radius to 500m or more
- For emulator: Send mock location matching session location

### Issue: Build Fails

**Solution**:
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Issue: Metro Bundler Cache Issues

**Solution**:
```bash
npm start -- --reset-cache
```

---

## 📊 Testing with Mock Data

### For Testing Without Moving Physically:

1. **Set Large Radius** when creating session (e.g., 500m or 1000m)

2. **Use Same Coordinates** for session location and testing:
   - Example: `-6.200000, 106.816666` (Jakarta)

3. **For Emulator**:
   - In Android Studio: Tools → Device Manager → Your AVD → ... → Extended Controls
   - Go to Location tab
   - Enter same coordinates as session
   - Click "Send"

4. **For Physical Device** (root required):
   - Install Mock Location app from Play Store
   - Enable Developer Options → Select Mock Location App
   - Set location to match session coordinates

---

## 🔑 Key Files Reference

### Mobile App Structure:
```
mobile/
├── src/
│   ├── screens/
│   │   ├── SessionsListScreen.js      # List all sessions grouped by class
│   │   ├── QRScannerScreen.js         # Camera QR code scanner
│   │   ├── AttendanceSubmitScreen.js  # Submit attendance form
│   │   └── ProfileScreen.js           # User profile & attendance history
│   ├── navigation/
│   │   └── MainNavigator.js           # Bottom tab navigation
│   ├── services/
│   │   └── api.js                     # API configuration (UPDATE THIS for device testing)
│   └── context/
│       └── AuthContext.js             # Authentication state
├── android/
│   └── app/src/main/
│       └── AndroidManifest.xml        # Permissions configuration
└── package.json                       # Dependencies
```

---

## 🎯 Production Deployment

### 1. Update API Endpoint:
- Change to production server URL in `api.js`
- Example: `https://api.gabta.com`

### 2. Generate Signed APK:
```bash
cd android
./gradlew assembleRelease
```
APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

### 3. Upload to Google Play Store:
- Create developer account
- Follow Play Console upload process
- Configure app listing, screenshots, etc.

---

## 📞 Support

For issues or questions:
1. Check error messages in Metro Bundler terminal
2. Check device logs: `adb logcat | grep -i react`
3. Verify backend is running and accessible
4. Test API endpoints in Postman or browser first

---

## ✅ Quick Start Checklist

- [ ] Node.js and React Native CLI installed
- [ ] Android Studio and Android SDK configured
- [ ] Mobile dependencies installed (`npm install`)
- [ ] Backend server running on port 5000
- [ ] API endpoint configured correctly in `api.js`
- [ ] Android permissions added to AndroidManifest.xml
- [ ] Emulator/Device connected (`adb devices`)
- [ ] App running (`npm run android`)
- [ ] Test login with mahasiswa account
- [ ] Create test session via web interface
- [ ] Grant camera and location permissions
- [ ] Successfully scan QR or enter manual code
- [ ] Submit attendance with valid location
- [ ] View updated profile statistics

---

**🎉 Happy Testing!** The mobile app is now ready to use for attendance submission with QR scanning and geolocation validation.
