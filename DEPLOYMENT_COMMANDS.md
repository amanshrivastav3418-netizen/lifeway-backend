# 🔧 COPY & PASTE DEPLOYMENT COMMANDS

This file contains all the commands you need to run, in order.  
Just copy and paste them into PowerShell (run as Administrator).

---

## PART A: GitHub Push (RUN FIRST)

Replace `YOUR_USERNAME` with your actual GitHub username:

```powershell
# Navigate to project root
cd "c:\Users\The Cosmic Connect\lifeway ka backend"

# Configure Git branch
git branch -M main

# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/lifeway-backend.git

# Push code to GitHub
git push -u origin main
```

**After running:**
- Go to: https://github.com/YOUR_USERNAME/lifeway-backend
- Verify all files are there

---

## PART B: Hostinger Database Setup (BEFORE Render)

Go to Hostinger cPanel and verify these are enabled:

1. **Remote MySQL Access**
   - Path: cPanel → Databases → Remote MySQL
   - Status: ✅ Enabled
   - Add: Either your IP OR `%` for all IPs

2. **Database Details** (for use in Render):
   ```
   HOST: mysql.hostinger.com
   USER: u790215710_lifeway_user
   PASSWORD: Lifeway@2026
   DATABASE: u790215710_lifewaycompute
   PORT: 3306
   ```

**Test connection from local machine:**
```
mysql -h mysql.hostinger.com -P 3306 -u u790215710_lifeway_user -p u790215710_lifewaycompute
```

---

## PART C: Render Deployment Setup

### Step 1: Create GitHub Personal Access Token (if needed)

If you don't have GitHub SSH set up:

1. Go to: https://github.com/settings/tokens
2. Click: "Generate new token" → "Generate new token (classic)"
3. Scope: Select `repo` (full control)
4. Click: "Generate token"
5. Copy the token (you'll need it for authentication)

### Step 2: Deploy on Render (Web Dashboard)

1. Go to: https://dashboard.render.com
2. Sign in (or create account)
3. Click: **"New +"** → **"Web Service"**
4. Click: **"Connect GitHub"**
   - Select your account
   - Search for: `lifewaycomputer/lifeway-backend`
   - Click: "Connect"

### Step 3: Configure Service

Fill in these fields exactly:

```
Name:              lifeway-backend
Environment:       Node
Region:            AWS (Frankfurt) ← or AWS (Mumbai)
Plan:              Free
Build Command:     npm install
Start Command:     npm start
```

### Step 4: Add ALL Environment Variables

In Render dashboard "Environment" section, add each variable:

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

**Then:** Click **"Create Web Service"**

**Wait:** 2-3 minutes for deployment to complete

---

## PART D: Update Frontend API URL

After Render deployment completes (see Step C):

1. Check your Render dashboard - you'll see a URL like:
   ```
   https://lifeway-backend.onrender.com
   ```
   (Your actual name might be different)

2. Edit file: `c:\Users\The Cosmic Connect\lifeway ka backend\api-service.js`

3. Find line ~20:
   ```javascript
   const API_BASE_URL = window.location.hostname === 'localhost' 
     ? 'http://localhost:3000/api' 
     : 'https://your-render-app-name.onrender.com/api';
   ```

4. Replace with YOUR Render URL:
   ```javascript
   const API_BASE_URL = window.location.hostname === 'localhost' 
     ? 'http://localhost:3000/api' 
     : 'https://lifeway-backend.onrender.com/api';
   ```

5. Save file

6. Upload to Hostinger:
   - Use Hostinger File Manager or FTP
   - Replace `/api-service.js`

---

## PART E: Test Everything

### Test 1: Health Check
```powershell
# In PowerShell, test health endpoint:
curl https://lifeway-backend.onrender.com/api/health
```

Expected response:
```json
{
  "status": "Server is running",
  "timestamp": "2026-03-12T12:34:56.789Z",
  "uptime": 45.67,
  "environment": "production"
}
```

### Test 2: From Frontend
1. Open: https://lifewaycomputer.org
2. Try to Login
3. Check Browser Console (F12) for errors
4. Should see no CORS errors

### Test 3: Check Render Logs
1. Go to Render Dashboard
2. Select service: `lifeway-backend`
3. Click: **Logs** tab
4. Should show:
   - ✅ Server running on port 3000
   - ✅ Connected to database
   - ✅ No errors

---

## PART F: After First Deployment

To update code in future:

```powershell
cd "c:\Users\The Cosmic Connect\lifeway ka backend"

# Make code changes...

# Create commit
git add .
git commit -m "Your description of changes"

# Push to GitHub
git push origin main

# Render will automatically redeploy!
# (Takes 1-2 minutes)
```

---

## 🆘 TROUBLESHOOTING COMMANDS

### Check Git Status
```powershell
cd "c:\Users\The Cosmic Connect\lifeway ka backend"
git status
git log --oneline
```

### Test Local Backend (Development)
```powershell
cd "c:\Users\The Cosmic Connect\lifeway ka backend\backend"
npm install
npm start
# Should see: "📚 Lifeway Backend Server running on port 3000"
# Press Ctrl+C to stop
```

### Check Node Version
```powershell
node --version
# Should be v18.x or higher
```

### Check Git Configuration
```powershell
git config --global user.name
git config --global user.email
```

### View Remote URL
```powershell
cd "c:\Users\The Cosmic Connect\lifeway ka backend"
git remote -v
# Should show your GitHub URL
```

### Force Push (⚠️ USE CAREFULLY)
```powershell
git push -u origin main --force
```

---

## ✅ SUMMARY OF FILES

After all steps, you should have:

✅ Code on GitHub at:  
   `https://github.com/YOUR_USERNAME/lifeway-backend`

✅ Backend running on Render at:  
   `https://lifeway-backend.onrender.com/api/health`

✅ Frontend updated with Render URL in:  
   `/api-service.js`

✅ Database working on Hostinger:  
   `mysql.hostinger.com:3306`

---

## 📋 COMMAND QUICK REFERENCE

| Action | Command |
|--------|---------|
| Init Git | `git init` |
| Add files | `git add .` |
| Commit | `git commit -m "message"` |
| Use main branch | `git branch -M main` |
| Add GitHub remote | `git remote add origin https://github.com/USER/lifeway-backend.git` |
| Push to GitHub | `git push -u origin main` |
| Check status | `git status` |
| View commits | `git log --oneline` |
| Test backend | `cd backend && npm start` |
| Test health | `curl http://localhost:3000/api/health` |
| Stop server | `Ctrl+C` |

---

**Ready to deploy? Start with PART A above!** 🚀
