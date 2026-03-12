# Render.com Integration - Quick Start Guide

## 🚀 TL;DR (30 Seconds)

**Your Goal:** Frontend on Hostinger + Backend on Render + Database on Hostinger

### Three Easy Steps:

1. **Get MySQL Details**
   - Hostinger cPanel → Databases → MySQL Databases
   - Copy: Host, Username, Password, Database name

2. **Deploy to Render**
   - Push backend to GitHub
   - Connect GitHub to Render (https://render.com)
   - Add environment variables from `.env.example`
   - Done! Your backend is live at `https://lifeway-backend.onrender.com`

3. **Connect Hostinger Frontend**
   - Edit `api-service.js` line ~20:
     ```javascript
     const API_BASE_URL = 'https://lifeway-backend.onrender.com/api';
     ```
   - Upload to Hostinger
   - Your frontend is now talking to Render backend ✓

---

## 📋 Full Setup Checklist

### Part 1: Prepare Hostinger (5 min)

- [ ] Go to **Hostinger cPanel**
- [ ] Navigate to **Databases** → **MySQL Databases**
- [ ] Find your database:
  - Name: `db123456_lifeway`
  - User: `db123456_user`  
  - Pass: `your_password`
- [ ] Go to **Remote MySQL**
- [ ] Ensure status is "Enabled"
- [ ] Add IP Address: `%` (wildcard, allows all)
- [ ] Click "Add"

### Part 2: Prepare Local Backend (3 min)

```bash
# Navigate to backend folder
cd backend

# Copy example env file
cp .env.example .env

# Edit .env - add your Hostinger details:
# DB_HOST=mysql.hostinger.com
# DB_USER=db123456_user
# DB_PASSWORD=your_password
# DB_NAME=db123456_lifeway
# FRONTEND_URLS=https://your-hostinger-domain.com
nano .env

# Test locally
npm install
npm start
# Should see: ✓ MySQL Database connected successfully
```

### Part 3: Deploy to Render (5 min)

1. **Push to GitHub**
   ```bash
   git add -A
   git commit -m "Render deployment setup"
   git push
   ```

2. **Go to Render.com**
   - https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Configure:
     - **Name:** lifeway-backend
     - **Runtime:** Node
     - **Build:** `npm install`
     - **Start:** `npm start`
   - Click "Advanced" → Add all variables from `.env`:
     ```
     NODE_ENV=production
     PORT=3000
     DB_HOST=mysql.hostinger.com
     DB_USER=db123456_user
     DB_PASSWORD=your_password
     DB_NAME=db123456_lifeway
     FRONTEND_URLS=https://your-hostinger-domain.com
     JWT_SECRET=[generate one: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]
     SESSION_SECRET=[generate one: same command as JWT_SECRET]
     RENDER_FREE_TIER=true
     ```
   - Click "Create Web Service"
   - Wait 2-5 minutes for deployment

3. **Get Your Render URL**
   - After deployment, you'll see: `https://lifeway-backend.onrender.com`
   - Test it: Open `https://lifeway-backend.onrender.com/api/health` in browser
   - Should show: `{"status":"Server is running"...}`

### Part 4: Update Frontend (2 min)

Edit **`api-service.js`** (line ~20):

```javascript
// FROM THIS:
const API_BASE_URL = 'http://localhost:5000/api';

// TO THIS:
const API_BASE_URL = 'https://lifeway-backend.onrender.com/api';
```

Upload to Hostinger via FTP or cPanel File Manager.

### Part 5: Test Everything (2 min)

- [ ] Open your Hostinger site
- [ ] Open DevTools (F12 → Console)
- [ ] Try login or any form submission
- [ ] Check Network tab
- [ ] Should see requests to `https://lifeway-backend.onrender.com/api/...`
- [ ] Database should be working automatically

---

## 🔧 Troubleshooting

### Problem: "Cannot reach backend"

**Solution:**
1. Check Render deployed successfully (green status)
2. Test URL directly: `https://lifeway-backend.onrender.com/api/health`
3. Check Render logs for errors (Dashboard → Service → Logs)

### Problem: "MySQL connection failed"

**Solution:**
1. Verify credentials in `.env` are 100% correct
2. Check Hostinger Remote MySQL is Enabled
3. Test connection locally first: `npm start` in backend folder
4. Check Hostinger firewall isn't blocking

### Problem: "CORS error - blocked"

**Solution:**
1. Go to Render Dashboard → Environment Variables
2. Update `FRONTEND_URLS` to match your Hostinger domain exactly
3. Save and redeploy
4. Clear browser cache (Ctrl+Shift+Del)

### Problem: "App spins down after inactivity"

**Normal!** Free tier Render apps sleep after 15 min of inactivity.

**Solutions:**
- Upgrade to Paid plan ($7/month) for always-on
- OR add a cron job to ping `/api/health` every 10 min

### Problem: "Database tables don't exist"

**Solution:**
- Backend should auto-create tables on first run
- Check Render logs for creation confirmation
- If not creating:
  1. Check MySQL connection works
  2. Verify database user has CREATE TABLE permission in Hostinger

---

## 📊 Architecture Summary

```
YOUR HOSTINGER WEBSITE
├─ index.html (frontend UI)
├─ style.css (styling)
├─ script.js (page logic)
└─ api-service.js ←── UPDATED WITH RENDER URL
         │
         │ HTTPS requests
         ↓
RENDER.COM BACKEND
├─ server.js (Express app)
├─ routes/ (API endpoints)
├─ controllers/ (business logic)
├─ models/ (database models)
└─ middleware/ (auth, CORS, etc)
         │
         │ TCP queries
         ↓
HOSTINGER MYSQL
├─ users table
├─ students table
├─ courses table
└─ ... (auto-created)
```

---

## 🔑 Environment Variables Explained

| Variable | Example | Where to get |
|----------|---------|--------------|
| `NODE_ENV` | `production` | Render env |
| `PORT` | `3000` | Render assigns |
| `DB_HOST` | `mysql.hostinger.com` | Hostinger cPanel |
| `DB_USER` | `db123456_user` | Hostinger cPanel |
| `DB_PASSWORD` | `p@ssw0rd` | Hostinger cPanel |
| `DB_NAME` | `db123456_lifeway` | Hostinger cPanel |
| `FRONTEND_URLS` | `https://your-domain.com` | Your Hostinger |
| `JWT_SECRET` | `random_32_chars` | Generate: `node -e "..."` |
| `SESSION_SECRET` | `random_32_chars` | Generate: `node -e "..."` |
| `RENDER_FREE_TIER` | `true` | Set to true |
| `KEEP_ALIVE_INTERVAL` | `25000` | Default value |
| `PING_INTERVAL` | `30000` | Default value |

---

## ✅ Success Indicators

Your setup is working when:

1. **Render Dashboard shows GREEN** ✅
2. **Health check works:** `https://lifeway-backend.onrender.com/api/health`
3. **Render logs show:**
   ```
   ✓ MySQL Database connected successfully
   📚 Lifeway Backend Server running on port 3000
   ```
4. **Frontend can login:** Try username/password on your Hostinger site
5. **No CORS errors** in browser console
6. **Database operations work:** Add student, view dashboard, etc.

---

## 📲 API Endpoints (For Reference)

### Authentication
```
POST /api/auth/login
POST /api/auth/register-student
POST /api/auth/register-center
POST /api/auth/logout
POST /api/auth/change-password
```

### Students
```
GET /api/students - Get all students
GET /api/students/:id - Get one student
POST /api/students - Create student
PUT /api/students/:id - Update student
DELETE /api/students/:id - Delete student
```

### Courses
```
GET /api/courses - Get all courses
GET /api/courses/:id - Get one course
POST /api/courses - Create course
```

### Dashboard
```
GET /api/dashboard/student - Student dashboard data
GET /api/dashboard/center - Center dashboard data
GET /api/dashboard/admin - Admin dashboard data
```

### Health Check
```
GET /api/health - Server status
```

---

## 🆘 Getting Help

1. **Check Render Logs** (most helpful)
   - Dashboard → Your Service → Logs tab
   - Scroll through for error messages
   - Copy-paste errors in search engines

2. **Read Documentation**
   - Render: https://render.com/docs
   - Hostinger: https://hpanel.hostinger.com

3. **Test Components**
   ```bash
   # Test Render backend
   curl https://lifeway-backend.onrender.com/api/health
   
   # Test MySQL connection (from backend folder)
   npm start
   
   # Test from frontend console
   fetch('https://lifeway-backend.onrender.com/api/health').then(r => r.json()).then(console.log)
   ```

4. **Contact Support**
   - Render Support: https://render.com/support
   - Hostinger Support: Through hpanel

---

## 🎉 What's Next?

Once everything works:

1. **Upgrade Render (Optional)**
   - Free tier is fine for testing
   - Paid tier ($7/month) for production (always-on)

2. **Monitor Logs Regularly**
   - Check for errors daily
   - Monitor database queries

3. **Backup Database**
   - Hostinger cPanel → Databases → Backups
   - Download monthly backups

4. **Add More Features**
   - Now your backend can handle anything!
   - Database is fully functional
   - All APIs are ready to use

5. **Keep Dependencies Updated**
   - Monthly: `npm update`
   - Commit changes to git
   - Render auto-deploys

---

## 📚 Additional Resources

- **[RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)** - Complete 8-part guide
- **[HOSTINGER_RENDER_INTEGRATION.md](HOSTINGER_RENDER_INTEGRATION.md)** - Detailed integration
- **[API_TESTING_GUIDE.md](API_TESTING_GUIDE.md)** - Test all endpoints
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - What's included

---

**Version:** 2.0  
**Status:** Production Ready ✓  
**Last Updated:** 2024

**Your Lifeway Computers system is ready to serve thousands of students!**
