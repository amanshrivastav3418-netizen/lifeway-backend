# 🚀 HOSTINGER DEPLOYMENT - QUICK CHECKLIST

## 📝 QUICK DEPLOYMENT IN 5 STEPS

### ✅ STEP 1: Login to Hostinger cPanel
- Go to: https://hostinger.in/cpanel-login
- Username: Your cPanel username
- Password: Your cPanel password
- Click: **Login**

---

### ✅ STEP 2: Upload Backend Files

**Via cPanel File Manager (easiest):**
1. Click: **File Manager**
2. Navigate to: **public_html**
3. Create folder: **api**
4. Download this file from your computer:
   - `c:\Users\The Cosmic Connect\lifeway ka backend\backend\`
5. ZIP the entire `backend` folder
6. Upload ZIP to `/api` folder
7. Right-click ZIP → **Extract**
8. Delete the ZIP file

---

### ✅ STEP 3: Install Dependencies

**In cPanel Terminal:**
1. Click: **Terminal** (under Advanced section)
2. Run this command:
```bash
cd ~/public_html/api && npm install
```
⏳ Wait 2-3 minutes...

---

### ✅ STEP 4: Create .env File

**In cPanel File Manager:**
1. Go to: `/public_html/api`
2. Right-click → **Create New File**
3. Name it: `.env`
4. Edit and paste EXACTLY:

```
NODE_ENV=production
PORT=3000
DB_HOST=mysql.hostinger.com
DB_PORT=3306
DB_USER=u790215710_lifeway_user
DB_PASSWORD=Lifeway@2026
DB_NAME=u790215710_lifewaycompute
JWT_SECRET=d55763ddea99a11bfa473c88efbb168ce52255c49cf296f5ba0908852490be9b
SESSION_SECRET=2bddada3eadec0ca250dbeb54faf523c483f43372ca9629c986eac472735f13f
FRONTEND_URLS=https://lifewaycomputer.org,http://localhost:3000,http://localhost:5000
DB_WAIT_FOR_CONNECTIONS=true
DB_CONNECTION_LIMIT=10
DB_QUEUE_LIMIT=0
DB_ENABLE_KEEP_ALIVE=true
DB_KEEP_ALIVE_INITIAL_DELAY_MS=0
```

5. Click: **Save**

---

### ✅ STEP 5: Setup Node.js Application

**In cPanel:**
1. Find: **Node.js Selector** or **Node.js Manager** or **Applications**
2. Click: **Create Application**
3. Fill in:
   - **Node.js Version**: 18.x or higher
   - **Mode**: production
   - **Root Path**: `/public_html/api`
   - **Startup File**: `server.js`
   - **Application Port**: 3000
   - **Domain/URL**: `lifewaycomputer.org` (or your domain)

4. Click: **Deploy** or **Create**
5. Wait for "Application has been deployed" message

---

## ✅ VERIFY IT'S WORKING

**Test 1: Check Backend Health**
- Go to: https://lifewaycomputer.org/api/health
- Should show: `{"status":"ok","message":"Server is running"}`

**Test 2: Test Login**
- Go to: https://lifewaycomputer.org
- Click: **Login** button
- Try login with any student account
- Should work without errors ✓

**Test 3: Check Browser Console**
- Press: F12
- Look at: **Console** tab
- Should NOT show any red errors

---

## 🆘 COMMON ERRORS & FIXES

| Error | Fix |
|-------|-----|
| `port 3000 already in use` | Change PORT in .env to 3001 |
| `Cannot connect to database` | Check DB_PASSWORD in .env is correct |
| `npm: command not found` | Enable Node.js in cPanel → Node.js Selector |
| `502 Bad Gateway` | Restart Node.js app in cPanel |
| `CORS error in console` | Ensure API_BASE_URL in api-service.js is correct |

---

## 📚 DETAILED GUIDE

For more detailed instructions, read:
- **HOSTINGER_DEPLOYMENT_GUIDE.md** (full guide with screenshots)

---

## ✅ YOU'RE DONE!

Once login works, your backend is **LIVE** on Hostinger! 🎉

API URL: `https://lifewaycomputer.org/api`
Frontend: `https://lifewaycomputer.org`

---
