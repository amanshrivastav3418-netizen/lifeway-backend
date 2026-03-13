# 🚀 HOSTINGER DIRECT DEPLOYMENT GUIDE

Deploy your Node.js backend directly to **Hostinger Hosting**.

---

## ✅ PREREQUISITES

- ✓ Hostinger account with cPanel access
- ✓ Node.js hosting plan (or VPS)
- ✓ SSH access to your account
- ✓ MySQL database already created (u790215710_lifewaycompute)

---

## 📋 STEP 1: LOGIN TO HOSTINGER cPANEL

1. Go to: https://hostinger.in/cpanel-login
2. Enter your **cPanel username and password**
3. Click: **Login**

---

## 📋 STEP 2: ACCESS FILE MANAGER

1. In cPanel, find: **File Manager**
2. Click on it
3. Navigate to: **public_html** folder

---

## 📋 STEP 3: UPLOAD BACKEND FILES

### Option A: Upload ZIP (RECOMMENDED)

1. On your computer:
   - Go to: `c:\Users\The Cosmic Connect\lifeway ka backend\backend`
   - Right-click the folder → **Send to → Compressed (zipped) folder**
   - Creates: `backend.zip`

2. In cPanel File Manager:
   - Create new folder: `api` (in public_html)
   - Upload: `backend.zip` into `/api` folder
   - Right-click → **Extract**
   - Delete: `backend.zip`

### Option B: Upload via SSH (FAST)

```bash
cd ~/public_html
mkdir api
cd api
# Upload from your computer using SCP or SFTP client
scp -r backend/* username@your-hostinger-domain.com:~/public_html/api/
```

---

## 📋 STEP 4: INSTALL DEPENDENCIES

### Via cPanel Terminal:

1. In cPanel, find: **Terminal** (under Advanced)
2. Run:
```bash
cd ~/public_html/api
npm install
```

⏳ Wait 2-3 minutes for installation to complete

---

## 📋 STEP 5: CREATE .env FILE

1. In cPanel File Manager, navigate to: `~/public_html/api`
2. Right-click → **Create New File** → Name: `.env`
3. Edit the file and add:

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

4. Click: **Save**

---

## 📋 STEP 6: SET UP NODEJS APP (IMPORTANT!)

1. In cPanel, find: **Node.js Selector** or **Node.js Manager**
2. Click on it
3. Click: **Create Application**
4. Fill in:
   - **Node.js version**: 18.x (or latest)
   - **Application mode**: production
   - **Application root**: `/public_html/api`
   - **Application startup file**: `server.js`
   - **Application URL**: Point to your domain or subdomain
   - **Port**: 3000

5. Click: **Deploy**

---

## 📋 STEP 7: VERIFY DEPLOYMENT

1. Go to your domain: **https://lifewaycomputer.org/api/health**
2. Should show:
   ```json
   {"status":"ok","message":"Server is running"}
   ```

If error, check:
- .env file is in the correct folder
- Database credentials are correct
- Node.js app is running in cPanel

---

## 📋 STEP 8: UPDATE FRONTEND API URL

Edit: `api-service.js` on your frontend

Change:
```javascript
const API_BASE_URL = 'http://localhost:3000/api';
```

To:
```javascript
const API_BASE_URL = 'https://lifewaycomputer.org/api';
```

Upload to: `~public_html/api-service.js`

---

## 🧪 TEST LOGIN

1. Go to: https://lifewaycomputer.org
2. Click: **Login**
3. Try login with a student account
4. Should work without errors ✓

---

## 🔧 TROUBLESHOOTING

### Error: "npm: command not found"
- Ensure Node.js is enabled in cPanel
- Go to: Node.js Selector → Verify Node version is active

### Error: "Cannot connect to database"
- Check .env DB_PASSWORD is correct
- Ensure MySQL username/password is right
- Verify database exists: `u790215710_lifewaycompute`

### Error: "Port 3000 already in use"
- Change PORT in .env to 3001 or 3002
- Update Node.js app port in cPanel

### 502 Bad Gateway
- Restart Node.js app in cPanel
- Check app logs in cPanel > Node.js Selector

---

## ✅ DEPLOYMENT COMPLETE!

Once login works on https://lifewaycomputer.org, your backend is live! 🎉

For support:
- Check cPanel logs for errors
- Verify .env file exists and has correct values
- Ensure database is accessible
