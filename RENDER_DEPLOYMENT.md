# Render.com Deployment Guide - Lifeway Computers Backend

## Overview

This guide walks you through deploying the Lifeway Computers backend to **Render.com** while keeping your frontend on Hostinger and database on Hostinger MySQL.

### Architecture
```
Hostinger Frontend (HTML/CSS/JavaScript)
           ↓ (API Calls via HTTPS)
Render.com Backend (Node.js/Express)
           ↓ (Database Queries via TCP)
Hostinger MySQL Database
```

---

## Part 1: Prepare for Render Deployment

### 1.1 Prerequisites
- [ ] Render.com account (free signup at https://render.com)
- [ ] Git installed on your machine
- [ ] GitHub account (recommended for automatic deploys)
- [ ] Backend code with Procfile and runtime.txt (already created)
- [ ] Hostinger MySQL database details
- [ ] Your Hostinger domain and frontend URL

### 1.2 Get Hostinger MySQL Connection Details

1. **Login to Hostinger cPanel**
   - Go to https://hpanel.hostinger.com
   - Click "Dashboard" for your website

2. **Find MySQL Database Credentials**
   - Navigate to **Databases** → **MySQL Databases**
   - Note down:
     - Database Name (e.g., `db123456_lifeway`)
     - Username (e.g., `db123456_user`)
     - Password (your chosen password)

3. **Enable Remote MySQL Connection**
   - In **Databases** → **Remote MySQL**
   - Click "Add IP Address"
   - Leave blank (%) to allow connections from any IP (Render)
   - Or add specific Render IPs (get from Render after deployment)

4. **Get MySQL Host**
   - Remote MySQL host: usually `mysql.hostinger.com` or `db123456.mysql.net`
   - Check your Hostinger documentation for exact hostname

---

## Part 2: Set Up Local Development First

### 2.1 Configure .env File

1. **Create `.backend/.env` file** (copy from `.env.example`)

```bash
# In your backend folder
cd backend
cp .env.example .env
```

2. **Edit `.env` with your Hostinger details**

```env
# Server
NODE_ENV=development
PORT=3000

# Hostinger MySQL Database
DB_HOST=mysql.hostinger.com
DB_PORT=3306
DB_USER=db123456_user
DB_PASSWORD=your_actual_password
DB_NAME=db123456_lifeway

# Frontend (update with your Hostinger domain)
FRONTEND_URL=https://your-hostinger-domain.com
FRONTEND_URLS=https://your-hostinger-domain.com,http://localhost:3000

# JWT Secret (generate a new one!)
JWT_SECRET=generate_a_random_very_secure_string_here_at_least_32_characters

# Other settings...
```

### 2.2 Test Local Connection

```bash
# In backend folder
npm install
npm start
```

Expected output:
```
✓ MySQL Database connected successfully
  Host: mysql.hostinger.com
  Database: db123456_lifeway
  Pool Connections: 10

📚 Lifeway Backend Server running on port 3000
Health check: http://localhost:3000/api/health
```

If connection fails, check:
- MySQL credentials are correct
- Hostinger Remote MySQL is enabled
- Firewall isn't blocking port 3306
- Database/user actually exists in Hostinger

### 2.3 Test API Endpoints

```bash
# Health check
curl http://localhost:3000/api/health

# Should return:
# {"status":"Server is running","timestamp":"...","uptime":1.234,"environment":"development"}
```

---

## Part 3: Deploy to Render.com

### 3.1 Push Code to GitHub

1. **Initialize Git repository** (if not already done)

```bash
cd [your-project-folder]
git init
git add -A
git commit -m "Initial commit: Lifeway backend for Render deployment"
```

2. **Create GitHub repository**
   - Go to https://github.com/new
   - Create repo (e.g., `lifeway-backend`)
   - Don't initialize with README

3. **Push to GitHub**

```bash
git remote add origin https://github.com/your-username/lifeway-backend.git
git branch -M main
git push -u origin main
```

### 3.2 Create Render Service

1. **Go to Render.com Dashboard**
   - https://dashboard.render.com

2. **Create New Web Service**
   - Click "New +" button
   - Select "Web Service"

3. **Connect GitHub Repository**
   - Click "Connect account" if needed
   - Select `lifeway-backend` repository
   - Branch: `main`
   - Autodeploy: ON (recommended)

4. **Configure Service**
   - **Name:** `lifeway-backend` (or similar)
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free (for testing) or Paid (for production)

5. **Add Environment Variables**

   Click "Advanced" → "Add Environment Variables"
   
   Add these variables (same as your `.env`):

   ```
   NODE_ENV=production
   PORT=3000
   
   DB_HOST=mysql.hostinger.com
   DB_PORT=3306
   DB_USER=db123456_user
   DB_PASSWORD=your_actual_password
   DB_NAME=db123456_lifeway
   
   FRONTEND_URL=https://your-hostinger-domain.com
   FRONTEND_URLS=https://your-hostinger-domain.com
   
   JWT_SECRET=generate_a_random_super_secure_string_here
   SESSION_SECRET=another_random_secure_string_here
   
   RENDER_FREE_TIER=true
   KEEP_ALIVE_INTERVAL=25000
   PING_INTERVAL=30000
   ```

   ⚠️ **CRITICAL: Use different/stronger values for production!**

6. **Create Service**
   - Click "Create Web Service"
   - Wait for deployment to complete (2-5 minutes)

### 3.3 Verify Deployment

1. **Get Your Render URL**
   - Once deployed, you'll see URL like: `https://lifeway-backend.onrender.com`
   - Test health endpoint: https://lifeway-backend.onrender.com/api/health

2. **Check Logs**
   - In Render dashboard, click your service
   - View "Logs" tab
   - Look for: "✓ MySQL Database connected successfully"
   - Look for: "📚 Lifeway Backend Server running on port 3000"

3. **Common Issues & Solutions**

   **Issue:** "Cannot find module" error
   ```
   Solution: Ensure package.json is in root of backend folder
   ```

   **Issue:** Database connection failed
   ```
   Solution: 
   - Verify Hostinger Remote MySQL is enabled
   - Check firewall allows external connections
   - Verify credentials in environment variables
   - Test with Hostinger's MySQL workbench first
   ```

   **Issue:** CORS errors in browser console
   ```
   Solution:
   - Update FRONTEND_URLS in Render environment variables
   - Ensure your Hostinger domain is included
   ```

   **Issue:** Free tier app spins down after inactivity
   ```
   Solution: This is normal on Render free tier. The KEEP_ALIVE settings help restart faster.
   Upgrade to Paid plan for always-on availability.
   ```

---

## Part 4: Connect Frontend to Render Backend

### 4.1 Update Frontend API URL

Edit **`api-service.js`** in your Hostinger frontend:

```javascript
// Line ~20 - Update this:
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api' 
  : 'https://lifeway-backend.onrender.com/api'; // ← Change to YOUR Render URL
```

### 4.2 Upload Files to Hostinger

Use FTP or File Manager in cPanel:
- Upload `api-service.js` to your public_html folder
- Update `index.html` if needed (ensure it references api-service.js)

### 4.3 Test Frontend-Backend Communication

1. **Open your Hostinger site:** https://your-hostinger-domain.com
2. **Open Browser DevTools:** F12 → Console
3. **Try login or any API call**
4. **Check Network tab** - should see requests to `https://lifeway-backend.onrender.com/api/...`

---

## Part 5: Production Optimization

### 5.1 Upgrade to Paid Plan (Recommended)

**Free Tier Limitations:**
- Spins down after 15 minutes of inactivity
- Slow startup (30+ seconds)
- Limited resources
- No uptime guarantees

**Paid Tier Benefits:**
- Always-on availability
- Fast startup
- Dedicated resources
- Professional monitoring

To upgrade:
1. Go to Render service dashboard
2. Click "Plan" tab
3. Choose Starter Plan ($7/month) or higher

### 5.2 Enable Monitoring

In Render dashboard:
- Set up email alerts for crashes
- Monitor deployment history
- View metrics and logs

### 5.3 Database Backups

In Hostinger cPanel:
- Regularly backup MySQL database
- Download backups locally
- Test recovery procedures

### 5.4 SSL Certificate

Both Hostinger and Render provide free SSL:
- ✓ Hostinger: Automatic with cPanel
- ✓ Render: Automatic for .onrender.com domains

### 5.5 Performance Tips

1. **Enable Keep-Alive** (already configured)
   - Reduces connection overhead
   - Keeps database connections warm

2. **Use Connection Pooling** (already configured)
   - Max 10 connections to Hostinger MySQL
   - Prevents connection exhaustion

3. **Implement Caching** (optional)
   - Add Redis cache on Render (paid add-on)
   - Cache frequently accessed data

4. **Optimize Database Queries**
   - Use indexes on frequently filtered fields
   - Monitor slow queries in logs

---

## Part 6: Troubleshooting

### Debug Mode

To enable detailed logging, update Render environment variables:

```
DEBUG=true
LOG_LEVEL=debug
NODE_ENV=development
```

Check logs in Render dashboard for detailed error messages.

### Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `ECONNREFUSED` | Can't reach Hostinger MySQL | Enable Remote MySQL in Hostinger, whitelist Render IPs |
| `PROTOCOL_CONNECTION_LOST` | Database connection dropped | Check keep-alive settings, increase connection timeout |
| `CORS errors` | Frontend domain not in CORS whitelist | Update FRONTEND_URLS in environment variables |
| `401 Unauthorized` | Invalid JWT token | Check JWT_SECRET matches frontend and backend |
| `Cannot POST /api/auth/login` | Route not found | Verify all route files exist in routes/ folder |
| `Module not found` | Missing npm package | Run `npm install` locally, commit package-lock.json to git |

### Get Help

1. **Check Render Logs**
   - Service dashboard → Logs tab
   - Scroll through for error messages

2. **Check Backend Logs**
   - Same place - shows console output from Node.js

3. **Test API Directly**
   ```bash
   curl https://lifeway-backend.onrender.com/api/health
   ```

4. **Contact Support**
   - Render: https://render.com/support
   - Hostinger: Contact through hpanel.hostinger.com

---

## Part 7: Maintenance & Monitoring

### Weekly Tasks
- [ ] Check Render logs for errors
- [ ] Verify frontend can talk to backend
- [ ] Monitor database connection pool

### Monthly Tasks
- [ ] Review API usage patterns
- [ ] Optimize slow endpoints
- [ ] Update dependencies: `npm update`
- [ ] Backup database from Hostinger

### Quarterly Tasks
- [ ] Full security audit
- [ ] Performance profiling
- [ ] Plan infrastructure upgrades
- [ ] Review error tracking logs

---

## Part 8: FAQ

**Q: Will my frontend break when I deploy?**
A: No! Your Hostinger frontend is completely separate. Just update the API URL in api-service.js.

**Q: Is Render secure for production?**
A: Yes! Render uses industry-standard security, automatic HTTPS, and is fully compliant.

**Q: Can I use a custom domain for my backend?**
A: Yes! Add a custom domain in Render service settings (premium feature).

**Q: What if my app spins down?**
A: Normal on free tier. Upgrade to Paid plan for always-on.

**Q: How do I rollback if something breaks?**
A: In Render dashboard, select a previous deployment and redeploy it.

**Q: Can I run multiple versions?**
A: Yes! Create multiple Render services for staging, testing, and production.

---

## Summary

✅ Backend running on Render.com  
✅ Frontend on Hostinger (unchanged)  
✅ Database on Hostinger MySQL  
✅ Automatic deploys on git push  
✅ Open 24/7 for your institute  

Your Lifeway Computers system is now globally distributed and production-ready!

---

**Version:** 2.0  
**Last Updated:** 2024  
**Questions?** Check Render docs: https://render.com/docs
