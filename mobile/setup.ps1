# GABTA Mobile - Complete Setup Script
# Run this script in PowerShell to set up the mobile app

Write-Host "🚀 GABTA Mobile App Setup Script" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Navigate to mobile directory
Set-Location d:\GABTA\mobile

Write-Host "📦 Step 1: Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "📦 Step 2: Installing additional required packages..." -ForegroundColor Yellow
npm install react-native-qrcode-scanner react-native-camera react-native-geolocation-service react-native-permissions react-native-vector-icons --save

Write-Host ""
Write-Host "🔗 Step 3: Linking native dependencies..." -ForegroundColor Yellow
npx react-native link react-native-vector-icons

Write-Host ""
Write-Host "📱 Step 4: Setting up Android project..." -ForegroundColor Yellow

# Check if android folder exists
if (Test-Path "android/app") {
    Write-Host "✅ Android folder exists" -ForegroundColor Green
    
    # Create AndroidManifest.xml path
    $manifestPath = "android/app/src/main"
    if (-not (Test-Path $manifestPath)) {
        Write-Host "📁 Creating manifest directory..." -ForegroundColor Yellow
        New-Item -ItemType Directory -Force -Path $manifestPath
    }
    
    Write-Host "✅ Android setup complete" -ForegroundColor Green
} else {
    Write-Host "⚠️ Android folder not found. You need to:" -ForegroundColor Red
    Write-Host "  1. Delete the android folder if it exists" -ForegroundColor Yellow
    Write-Host "  2. Run: npx react-native init gabtaMobile --template react-native@0.67.4" -ForegroundColor Yellow
    Write-Host "  3. Copy the src folder to the new project" -ForegroundColor Yellow
    Write-Host "  4. Re-run this setup script" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Start the backend server: cd ..\server && npm run dev" -ForegroundColor White
Write-Host "2. Start Metro bundler: npm start" -ForegroundColor White
Write-Host "3. Run on Android: npm run android" -ForegroundColor White
Write-Host ""
Write-Host "📖 For detailed instructions, see MOBILE_SETUP_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
