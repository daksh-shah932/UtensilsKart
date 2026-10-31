# UtensilKart Integration Test Checklist

## ✅ Pre-flight Checks

### Backend Setup
- [ ] `functions/service-account.json` exists (downloaded from Firebase Console)
- [ ] `functions/.env` has `GCLOUD_PROJECT=ipd-project-63fbf`
- [ ] `functions/package.json` dependencies installed (`npm install`)

### Frontend Setup
- [ ] `frontend/.env.local` has all Firebase config values filled in
- [ ] `frontend/.env.local` has `NEXT_PUBLIC_API_BASE_URL=http://localhost:4001`
- [ ] `frontend/package.json` dependencies installed (`npm install`)

---

## 🧪 Connection Tests

### Step 1: Test Backend Connection
```powershell
cd d:/IPD/functions
node test-connection.js
```

**Expected output:**
```
✅ Firebase Admin initialized
✅ Firestore write successful
✅ Firestore read successful
✅ All connection tests passed!
```

---

### Step 2: Start Backend Server
```powershell
cd d:/IPD/functions
npm run dev
```

**Expected output:**
```
✅ UtensilKart API running at http://localhost:4001
```

**Test health endpoint:**
```powershell
curl http://localhost:4001/health
```

**Expected:** `{"status":"ok","timestamp":"..."}`

---

### Step 3: Test Backend Endpoints

**Test 1: OTP Request (no auth required)**
```powershell
curl -X POST http://localhost:4001/api/auth/otp/request `
  -H "Content-Type: application/json" `
  -d '{"identifier":"+919876543210","channel":"sms"}'
```

**Expected:** `{"message":"OTP sent via sms...","_devOtp":"123456"}`

---

**Test 2: Products List (no auth required)**
```powershell
curl http://localhost:4001/api/products
```

**Expected:** `{"products":[],"pagination":{...}}` (empty initially — need to seed data)

---

**Test 3: 404 handling**
```powershell
curl http://localhost:4001/api/invalid
```

**Expected:** `{"error":"Route not found"}`

---

### Step 4: Start Frontend
```powershell
cd d:/IPD/frontend
npm run dev
```

**Open:** [http://localhost:3000](http://localhost:3000)

---

## 🔗 Integration Tests (Frontend → Backend → Database)

### Test 1: Health Check Page Load
1. Open [http://localhost:3000](http://localhost:3000)
2. ✅ Home page loads with hero + category cards
3. ✅ Navbar visible with "UtensilKart" logo

---

### Test 2: Products Page (Empty State)
1. Click **"Shop now"** or navigate to [http://localhost:3000/products](http://localhost:3000/products)
2. ✅ Page loads
3. ✅ Search bar + category filters visible
4. ✅ Shows "No products found" (database is empty)
5. **Check browser DevTools Network tab:**
   - ✅ `GET http://localhost:4001/api/products` → Status 200

---

### Test 3: OTP Login Flow
1. Navigate to [http://localhost:3000/login](http://localhost:3000/login)
2. Enter phone: `+919876543210`
3. Click **"Send OTP"**
4. ✅ OTP input screen appears
5. **Check browser console:**
   - Should NOT see CORS errors
   - Should see successful API response
6. **Check backend terminal:**
   - Should log: `[OTP] Generated for +919876543210: 123456`
7. Enter the OTP from backend logs
8. ✅ Redirects to home page
9. ✅ Navbar shows user icon (authenticated state)

---

### Test 4: Image Search Modal
1. Go to [http://localhost:3000/products](http://localhost:3000/products)
2. Click the **camera icon** next to search bar
3. ✅ Modal opens
4. Upload any image (JPEG/PNG)
5. ✅ Shows "Searching the catalog..."
6. ✅ Shows "No close matches found" (expected — no products yet)
7. **Check Network tab:**
   - ✅ `POST http://localhost:4001/api/search/image` → Status 200

---

## 🛠️ Common Issues

### ❌ "Cannot connect to backend"
**Fix:**
1. Check backend is running: `http://localhost:4001/health`
2. Check `.env.local` has `NEXT_PUBLIC_API_BASE_URL=http://localhost:4001`
3. Restart frontend after changing `.env.local`

---

### ❌ "CORS error" in browser console
**Fix:**
1. Check `functions/.env` has `ALLOWED_ORIGINS=http://localhost:3000`
2. Restart backend after changing `.env`

---

### ❌ "service-account.json not found"
**Fix:**
1. Download from: Firebase Console → Project Settings → Service Accounts → Generate new private key
2. Save as `d:/IPD/functions/service-account.json`

---

### ❌ "Firebase app not initialized"
**Fix:**
1. Check all Firebase config values are filled in `frontend/.env.local`
2. No empty values after `=`

---

## 🎯 Production Deployment Checklist

Before deploying:
- [ ] Change `frontend/.env.local`:
  ```
  NEXT_PUBLIC_API_BASE_URL=https://asia-south1-ipd-project-63fbf.cloudfunctions.net/api
  ```
- [ ] Update `functions/.env`:
  ```
  NODE_ENV=production
  ALLOWED_ORIGINS=https://your-production-domain.com
  ```
- [ ] Deploy Firestore rules: `firebase deploy --only firestore:rules`
- [ ] Deploy functions: `firebase deploy --only functions`
- [ ] Build frontend: `npm run build`

---

## 📊 Test Result Summary

| Test | Status | Notes |
|------|--------|-------|
| Backend health check | ⬜ | `http://localhost:4001/health` |
| Firestore connection | ⬜ | `node test-connection.js` |
| Frontend loads | ⬜ | `http://localhost:3000` |
| OTP request API | ⬜ | Network tab shows 200 |
| Products API | ⬜ | Returns empty array initially |
| Image search upload | ⬜ | Modal works, uploads image |
| No CORS errors | ⬜ | Browser console clean |

---

**All tests passing?** ✅ Your app is fully connected!

**Next:** Seed some product data in Firestore to see the full UI in action.
