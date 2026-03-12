# 🚀 Lifeway Backend - Production Deployment Guide (Render + Hostinger)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Your Architecture                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Frontend (Hostinger)  →  Backend (Render)  →  DB (Hostinger)  │
│  HTML/CSS/JS            Node.js/Express       MySQL              │
│  api-service.js         Port: 3000            Port: 3306         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ Pre-Deployment Checklist

### 1. Local Verification
- [ ] Backend runs successfully locally: `npm start`
- [ ] Health check responds: `http://localhost:3000/api/health`
- [ ] Database connects with local .env
- [ ] All API endpoints respond correctly
- [ ] Frontend successfully calls backend APIs locally

### 2. Git Setup
- [ ] Backend repo initialized: `git init`
- [ ] .gitignore includes: `.env`, `node_modules/`, `uploads/`, `.git`
- [ ] GitHub account ready
- [ ] SSH keys configured OR personal access token created

### 3. Hostinger MySQL Setup
- [ ] MySQL database created
- [ ] Database user created with password
- [ ] Remote MySQL access enabled
- [ ] Render IP whitelisted (instructions below)

### 4. Render.com Account
- [ ] Account created at render.com
- [ ] Free tier plan selected
- [ ] GitHub connected to Render

---

## 📋 Step-by-Step Deployment Guide

### STEP 1: Prepare Hostinger MySQL

**1a. Create MySQL Database**
- Go to Hostinger cPanel → Databases → MySQL Databases
- Create new database (e.g., `u790215710_lifewaycompute`)
- Note the database name

**1b. Create Database User**
- In MySQL Databases → Create New User
- Username: (e.g., `u790215710_lifeway_user`)
- Password: Create strong password
- All Privileges: ✓ Select All
- Note the username and password

**1c. Enable Remote MySQL Access (CRITICAL!)**
- Go to cPanel → Remote MySQL
- Add % (all IPs) to whitelist, OR
- Add Render IPs temporarily for testing:
  - After deployment, Render will show you its IP
  - Add it to Hostinger Remote MySQL access list

**1d. Collect Hostinger Database Details**
```
DB_HOST=    (Ask support or check cPanel - usually mysql.hostinger.com or your_cpanel.mysql.net)
DB_PORT=    3306 (default)
DB_USER=    (your database user)
DB_PASSWORD= (your password)
DB_NAME=    (your database name)
```

---

### STEP 2: Initialize Git Repository

```bash
cd backend
git init
git add .
git commit -m "Initial commit: Backend ready for Render deployment"
```

---

### STEP 3: Create GitHub Repository

1. Go to https://github.com/new
2. Create repository: `lifeway-backend`
3. Copy the commands:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/lifeway-backend.git
git push -u origin main
```

---

### STEP 4: Generate Secret Keys

Generate secure JWT and Session secrets:

```bash
# Generate JWT_SECRET
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Generate SESSION_SECRET
node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

Copy the generated values - you'll need them in Render.

---

### STEP 5: Deploy to Render.com

**5a. Connect GitHub to Render**
1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Select "Deploy from a Git repository"
4. Click "Connect GitHub" and authorize Render
5. Select: `YOUR_USERNAME/lifeway-backend`
6. Click "Create Web Service"

**5b. Configure Render Service**

In Render Dashboard, fill in:

| Field | Value |
|-------|-------|
| Name | lifeway-backend |
| Environment | Node |
| Region | (select closest to India) |
| Plan | Free |
| Build Command | `npm install` |
| Start Command | `npm start` |

**5c. Add Environment Variables**

In Render, go to "Environment":

```
NODE_ENV=production
PORT=3000
DB_HOST=(your Hostinger host)
DB_PORT=3306
DB_USER=(your Hostinger user)
DB_PASSWORD=(your Hostinger password)
DB_NAME=(your Hostinger database)
JWT_SECRET=(generated above)
SESSION_SECRET=(generated above)
FRONTEND_URLS=https://your-hostinger-domain.com,http://localhost:5000
DB_WAIT_FOR_CONNECTIONS=true
DB_CONNECTION_LIMIT=10
DB_QUEUE_LIMIT=0
DB_ENABLE_KEEP_ALIVE=true
DB_KEEP_ALIVE_INITIAL_DELAY_MS=0
```

**5d. Deploy**
- Click "Deploy Web Service"
- Wait 2-3 minutes for deployment
- Check logs for errors

---

### STEP 6: Test Render Backend

Once deployed, Render gives you a URL: `https://your-app-name.onrender.com`

**Test health endpoint:**
```bash
curl https://your-app-name.onrender.com/api/health
```

Expected response:
```json
{
  "status": "Server is running",
  "timestamp": "2026-03-12T...",
  "uptime": 123.45,
  "environment": "production"
}
```

---

### STEP 7: Update Frontend api-service.js

Edit: `/api-service.js`

Replace this line:
```javascript
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api' 
  : 'https://your-render-app-name.onrender.com/api';
```

With your actual Render URL:
```javascript
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api' 
  : 'https://lifeway-backend.onrender.com/api';  // ← Your actual Render URL
```

---

### STEP 8: Redeploy for Database Connection

After configuring environment variables in Render:
1. Go to Render Dashboard
2. Select "lifeway-backend" service  
3. Click "Redeploy" at the top
4. Wait for deployment
5. Check logs: `Connected to database: (your-host)`

---

### STEP 9: Test Full Integration

**Test from Frontend (Hostinger):**

1. Open your Hostinger frontend in browser
2. Try to login or perform an API action
3. Check browser console for any CORS errors
4. Check Render logs for errors

**Common CORS Issues:**
If you get CORS errors:
1. Go to Render Dashboard
2. Check FRONTEND_URLS variable
3. Make sure it matches your Hostinger domain exactly
4. Redeploy

---

## 🔧 Troubleshooting

### Database Connection Failed
- [ ] Check Hostinger Remote MySQL is enabled
- [ ] Verify DB credentials in Render
- [ ] Check if Render IP is whitelisted in Hostinger
- [ ] Ask Hostinger support for Render IP whitelist

### CORS Errors
- [ ] Verify FRONTEND_URLS in Render matches Hostinger domain
- [ ] Check frontend domain format (http:// vs https://)
- [ ] Redeploy after changing FRONTEND_URLS

### 502 Bad Gateway Error
- [ ] Check Render logs for startup errors
- [ ] Verify database connection parameters
- [ ] Check if database user has correct permissions

### Uploads Not Working
- [ ] Disable or remove upload features for Free tier
- [ ] OR upgrade to Render Standard tier for persistent storage

---

## 📚 File Structure After Deployment

```
backend/
├── .env                    ← NEVER commit (production secrets)
├── .env.example            ← Share with team (template)
├── .gitignore              ← Prevents .env from being committed
├── Procfile                ← Render knows to run: web: npm start
├── runtime.txt             ← Tells Render to use Node 18.17.0
├── render.yaml             ← Infrastructure as Code (optional advanced)
├── package.json
├── server.js               ← Listens on PORT from .env
├── config/
│   └── database.js         ← Reads DB_* from .env
├── routes/
│   └── auth.js, etc.
└── uploads/
```

---

## 🎯 Deployment Checklist (After Going Live)

Once your backend is running on Render, verify everything:

### Backend Status
- [ ] Render shows "Live" status
- [ ] Health check responds: `https://your-app.onrender.com/api/health`
- [ ] Logs show "Connected to database"
- [ ] No 502 or 500 errors in recent logs

### Database Connectivity
- [ ] Can login (database query successful)
- [ ] Student data loads correctly
- [ ] No SQL connection errors in logs

### Frontend Integration
- [ ] Frontend loads without API errors
- [ ] Login works end-to-end
- [ ] All forms submit successfully
- [ ] No CORS errors in browser console
- [ ] Student list, courses, enrollments all load

### API Endpoints Verification
- [ ] ✅ GET /api/health
- [ ] ✅ POST /api/auth/login
- [ ] ✅ GET /api/students
- [ ] ✅ GET /api/courses
- [ ] ✅ POST /api/enrollments
- [ ] ✅ PUT /api/students/:id
- [ ] ✅ GET /api/dashboard

### Security
- [ ] JWT_SECRET is strong (32+ chars, random)
- [ ] .env is NOT in git (check .gitignore)
- [ ] CORS only allows Hostinger domain
- [ ] No sensitive data in logs
- [ ] Rate limiting is active (test with many requests)

### Performance
- [ ] Response times < 500ms
- [ ] Database queries optimized
- [ ] No memory leaks (check Render metrics)
- [ ] Free tier resource limits sufficient

---

## 🆘 Support & Resources

- **Render Docs**: https://render.com/docs
- **Hostinger Support**: https://hostinger.com/support
- **MySQL Connection Issues**: Check Hostinger cPanel Remote MySQL
- **Node.js/Express**: Documentation at nodejs.org and expressjs.com

---

## 📝 Notes for Future Deployments

After the first deployment:
- **Code Updates**: Push to GitHub → Render auto-deploys
- **Environment Changes**: Update in Render Dashboard → Redeploy
- **Database Schema Changes**: Apply locally, test, then deploy
- **Monitor Logs**: Always check Render logs before contacting support

---

**✨ Congratulations! Your backend is now production-ready on Render.com!**
