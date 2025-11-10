# Android Studio - How to See Terminal & Debug

## 🔍 How to See Terminal in Android Studio

### Option 1: Built-in Terminal
1. In Android Studio, go to: **View → Tool Windows → Terminal**
2. Or use shortcut: **Alt + F12** (Windows/Linux) or **⌥ + F12** (Mac)
3. Terminal opens at the bottom of the window

### Option 2: Logcat (App Logs)
1. **View → Tool Windows → Logcat**
2. Or click **Logcat** tab at the bottom
3. Shows all app logs, errors, and console output
4. Filter by app name: Type "Diarium" in the search box

### Option 3: Run Tab (Build Output)
1. **View → Tool Windows → Run**
2. Shows build output, errors, and Gradle logs

## 🚀 Complete Setup Steps

### Step 1: Start Backend Server

**In a separate terminal window** (not Android Studio):
```bash
cd /Users/loukatran/Documents/projects/diarium-app/backend
npm run dev
```

You should see:
```
🚀 Diarium API server running on port 3000
✅ Database connected successfully
```

**Keep this terminal running** - the backend must stay running while testing.

### Step 2: Build and Run Android App

**In Android Studio:**
1. Click the **Run** button (green play icon) or press **Shift + F10**
2. Select your emulator from the device dropdown
3. Wait for the app to build and launch

### Step 3: Check Connection

**If login fails:**

1. **Check Backend is Running:**
   - In your backend terminal, you should see requests when you try to login
   - If no requests appear, the app can't reach the backend

2. **Check Logcat for Errors:**
   - Open Logcat in Android Studio
   - Look for red errors
   - Common errors:
     - `Network request failed` → Backend not running or wrong URL
     - `Connection refused` → Backend not running
     - `CORS error` → Backend CORS not configured (shouldn't happen)

3. **Verify API URL:**
   - The app should now use `http://10.0.2.2:3000` automatically
   - This is the special IP for Android emulator to access host machine

## 🔧 Troubleshooting Login Issues

### Issue: "Cannot connect to server"

**Solution 1: Verify Backend is Running**
```bash
# Test backend directly
curl http://localhost:3000/health
```

Should return:
```json
{"status":"healthy",...}
```

**Solution 2: Test from Emulator**
```bash
# In Android Studio terminal or adb shell
adb shell
# Then inside emulator shell:
curl http://10.0.2.2:3000/health
```

**Solution 3: Check CORS Settings**
Make sure backend allows requests from mobile app. Check `backend/src/server.js`:
```javascript
app.use(cors()); // Should allow all origins in development
```

### Issue: "Network request failed"

This means the app can't reach `10.0.2.2:3000`. Check:

1. **Backend is running on port 3000**
2. **No firewall blocking port 3000**
3. **Using correct emulator IP** (`10.0.2.2` for Android emulator)

### Issue: "Authentication failed"

1. **Check Logcat** for the actual error message
2. **Check backend terminal** for the error details
3. **Verify database is connected** (check backend terminal logs)

## 📱 Testing Tips

### View Network Requests

1. Open **Logcat** in Android Studio
2. Filter by tag: `chromium` or search for "http"
3. You'll see all network requests the app makes

### Debug JavaScript

1. In Chrome: `chrome://inspect`
2. Find your device → Click "inspect"
3. Opens Chrome DevTools for your app
4. You can see console logs, network requests, etc.

### View App State

Use Logcat and filter by your app's package name: `com.diarium.app`

## ✅ Quick Checklist

Before testing login:
- [ ] Backend server is running (`npm run dev` in backend folder)
- [ ] Backend shows "Database connected successfully"
- [ ] Android emulator is running
- [ ] App is installed and launched on emulator
- [ ] API URL is correctly set to `10.0.2.2:3000` (automatic now)
- [ ] Check Logcat for any errors

## 🎯 Next Steps After Login Works

Once login works:
1. Test creating diary entries
2. Test viewing entries
3. Test deleting entries
4. Test mood analysis

All should work the same as web version, but through the Android app!

