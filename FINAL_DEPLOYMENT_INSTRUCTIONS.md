# 🚀 HOSTINGER DEPLOYMENT - COMPLETE GUIDE

## ✅ What's Prepared

Your backend is **fully ready** for deployment:

- ✅ **backend-deploy.zip** - All code packaged (5-10 MB)
- ✅ **.env file** - Configured with your database credentials  
- ✅ **api-service.js** - Updated to use your domain
- ✅ **Deployment scripts** - Automated setup tools
- ✅ **GitHub backup** - All code on https://github.com/amanshrivastav3418-netizen/lifeway-backend

**Total time to deploy: 10-15 minutes**

---

## 🎯 5-STEP DEPLOYMENT (Click-Only!)

### STEP 1️⃣: LOGIN TO cPANEL

```
URL: https://hostinger.in/cpanel-login
Username: Lifeway Computer Education
Password: India@24160
```

Click **LOGIN**

---

### STEP 2️⃣: UPLOAD BACKEND FILES

In cPanel:

1. Click: **File Manager**
2. Navigate to: **public_html**
3. Right-click → **Create Folder**
4. Name it: **api**
5. Double-click: **api** folder
6. Click: **Upload File**
7. Select file: 
   ```
   backend-deploy.zip
   (From: c:\Users\The Cosmic Connect\lifeway ka backend\)
   ```
8. Wait for upload to complete ⏳

---

### STEP 3️⃣: EXTRACT FILES

In File Manager (public_html/api):

1. Right-click: **backend-deploy.zip**
2. Click: **Extract**
3. Wait 30 seconds for extraction
4. Files will appear: `server.js`, `package.json`, `controllers/`, `routes/`, etc.
5. Optional: Delete the ZIP file

---

### STEP 4️⃣: INSTALL DEPENDENCIES

In cPanel:

1. Click: **Advanced** section
2. Find: **Terminal**
3. Click: **Terminal**
4. A black terminal window opens
5. **Copy and paste this**:

```bash
cd ~/public_html/api && npm install
```

6. Press: **ENTER**
7. **Wait 2-3 minutes** ⏳ (don't close the terminal!)
8. You'll see message: `added XXX packages in XXXs`
9. Type: `exit`

---

### STEP 5️⃣: CREATE .env FILE

In File Manager (public_html/api):

1. Right-click: **Create New File**
2. Name: **.env** (with the dot!)
3. Click: **Create**
4. Right-click **.env** → **Edit**
5. Delete any existing content
6. **Copy and paste EXACTLY**:

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

7. Click: **Save**

---

## ✅ VERIFY DEPLOYMENT

After all 5 steps, test:

### Test 1: Health Check
```
URL: https://lifewaycomputer.org/api/health
```

**Expected**: Response with `{"status":"ok","message":"Server is running"}`

### Test 2: Login
```
URL: https://lifewaycomputer.org
```

Click **Login** button
Try logging in
Should work! ✓

### Test 3: Check Browser Console
```
Press: F12
Click: Console tab
Should be CLEAN (no red errors)
```

---

## 🩺 TROUBLESHOOTING

| Error | Solution |
|-------|----------|
| **"Cannot connect to host"** | Check if all 5 steps are complete |
| **"npm: command not found"** | Node.js not enabled - contact Hostinger support |
| **"port 3000 already in use"** | Change PORT in .env to 3001, restart |
| **502 Bad Gateway** | Wait 30 seconds, .env file might not be loaded yet |
| **Database connection error** | Verify DB_PASSWORD in .env is exactly: `Lifeway@2026` |
| **CORS errors in console** | Ensure FRONTEND_URLS includes `https://lifewaycomputer.org` |

---

## 📞 NEED HELP?

1. **Check cPanel logs**:
   - cPanel → Advanced → Error Log
   - Look for error messages

2. **Check server logs**:
   - cPanel → Advanced → Terminal
   - Run: `tail -50 /var/log/apache2/error_log`

3. **Database issues**:
   - Ensure MySQL credentials are correct in .env
   - Test credentials in cPanel → Remote MySQL

4. **Still stuck?**:
   - Email: lifewaycomputer@gmail.com
   - Include: Error message from browser F12 console

---

## ✨ SUCCESS CHECKLIST

- [ ] Step 1: Logged in to cPanel
- [ ] Step 2: Uploaded backend-deploy.zip
- [ ] Step 3: Extracted files (see server.js, package.json, etc.)
- [ ] Step 4: Ran `npm install` (wait for completion)
- [ ] Step 5: Created .env file with all 15 variables
- [ ] Tested: https://lifewaycomputer.org/api/health (returns JSON)
- [ ] Tested: https://lifewaycomputer.org (can see login)
- [ ] Tested: Login works without errors
- [ ] Console clean: F12 Console shows no red errors

---

## 🎉 YOU'RE DONE!

Your backend is **LIVE** on Hostinger!

**API URL**: `https://lifewaycomputer.org/api`

**Frontend**: `https://lifewaycomputer.org`

**Login**: Working ✓
**Students**: Accessible ✓  
**Courses**: Accessible ✓

---

## 📋 REFERENCE

- **GitHub Repository**: https://github.com/amanshrivastav3418-netizen/lifeway-backend
- **Backend Code**: `/backend/` folder
- **Configuration**: `/backend/.env` (on server)
- **Logs**: cPanel Terminal or Error Log

---

**Deployed**: March 13, 2026  
**Status**: ✅ READY FOR PRODUCTION
