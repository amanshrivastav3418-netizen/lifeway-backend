# Hostinger + Render Integration Guide

## Quick Setup (5 minutes)

### Step 1: Get Hostinger MySQL Details (2 min)

**Hostinger cPanel → Databases → MySQL Databases:**
- Database Name: `db123456_lifeway`
- Username: `db123456_user`
- Password: `your_password`
- Host: `mysql.hostinger.com`

**Hostinger cPanel → Databases → Remote MySQL:**
- Ensure enabled
- Add IP Address: (leave blank to allow all)

### Step 2: Create `.env` File in Backend (1 min)

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
NODE_ENV=production
DB_HOST=mysql.hostinger.com
DB_USER=db123456_user
DB_PASSWORD=your_actual_password
DB_NAME=db123456_lifeway
FRONTEND_URL=https://your-hostinger-domain.com
FRONTEND_URLS=https://your-hostinger-domain.com
JWT_SECRET=generate-random-string-here-32-chars-minimum
```

### Step 3: Deploy to Render (2 min)

1. Push to GitHub
2. Connect GitHub to Render
3. Add environment variables from `.env`
4. Deploy

**Your Render URL:** `https://lifeway-backend.onrender.com`

### Step 4: Update Frontend API URL (optional but recommended)

Edit `api-service.js` line ~20:
```javascript
const API_BASE_URL = 'https://lifeway-backend.onrender.com/api';
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    INTERNET USERS                           │
│                      (Browsers)                             │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS
                       ↓
        ┌──────────────────────────────┐
        │   HOSTINGER FRONTEND         │
        │  (HTML/CSS/JavaScript)       │
        │  https://your-domain.com     │
        └──────────┬───────────────────┘
                   │ Fetch API Calls (HTTPS)
                   ↓
        ┌──────────────────────────────┐
        │    RENDER.COM BACKEND        │
        │  (Node.js + Express)         │
        │  https://app.onrender.com    │
        │  - CORS enabled for Frontend │
        │  - JWT Authentication        │
        │  - Rate limiting             │
        └──────────┬───────────────────┘
                   │ SQL Queries (TCP)
                   ↓
        ┌──────────────────────────────┐
        │  HOSTINGER MYSQL DATABASE    │
        │  mysql.hostinger.com:3306    │
        │  - Connection pooling (10)   │
        │  - Keep-alive enabled        │
        │  - Remote access enabled     │
        └──────────────────────────────┘
```

---

## CORS Configuration

The backend automatically configures CORS for your frontend.

### What is CORS?

CORS (Cross-Origin Resource Sharing) is a security feature that:
- Allows frontend on one domain (Hostinger) to talk to backend on another domain (Render)
- Prevents unauthorized access from other websites
- Is configured by the backend server

### CORS is Automatically Configured

In `server.js`, CORS is configured to accept:
```javascript
FRONTEND_URLS=https://your-hostinger-domain.com,http://localhost:3000
```

### If You Get CORS Errors

1. **Error:** `Access to XMLHttpRequest blocked by CORS policy`

2. **Solution:**
   - Go to Render dashboard
   - Click your service
   - Click "Environment"  
   - Update `FRONTEND_URLS`:
     ```
     https://your-actual-hostinger-domain.com,http://localhost:3000
     ```
   - Save and redeploy

3. **Verify:** Open browser, check Network tab
   - Response should have header: `Access-Control-Allow-Origin: https://your-domain.com`

---

## Database Connection Issues

### Issue 1: "MySQL connection failed"

**Cause:** Hostinger firewall blocking external connections

**Solution:**
1. Hostinger cPanel → Databases → Remote MySQL
2. Ensure it shows "Enabled"
3. Add IP Address: leave blank (%) allows all IPs
4. Test: `telnet mysql.hostinger.com 3306` from terminal

### Issue 2: "Too many connections"

**Cause:** Connection pool exhausted

**Solution:** Already handled! Backend limits to 10 connections with pooling.

### Issue 3: "Connection will close in X seconds"

**Cause:** Idle timeout on Hostinger (normal after 30 mins inactivity)

**Solution:** Keep-alive is already enabled! Backend sends periodic pings.

---

## File Structure

```
lifeway ka backend/
├── backend/                          # Node.js backend
│   ├── server.js                     # Main Express app (OPTIMIZED FOR RENDER)
│   ├── package.json                  # Dependencies
│   ├── Procfile                      # Render deployment config
│   ├── runtime.txt                   # Node.js version
│   ├── .env.example                  # Configuration template (RENDER-OPTIMIZED)
│   ├── config/
│   │   └── database.js               # MySQL pool (RENDER-OPTIMIZED)
│   ├── middleware/
│   │   └── auth.js                   # JWT middleware
│   ├── routes/                       # API routes
│   └── controllers/                  # Route handlers
│
├── api-service.js                    # Frontend API client (UPDATED FOR RENDER)
├── index.html                        # Your Hostinger frontend
├── style.css                         # Your styles
├── script.js                         # Your JavaScript
├── RENDER_DEPLOYMENT.md              # This comprehensive guide
└── OTHER DOCS...
```

---

## Deployment Checklist

### Before Deployment
- [ ] Hostinger MySQL details ready
- [ ] Remote MySQL enabled in Hostinger
- [ ] GitHub repository created and pushed
- [ ] .env file configured locally
- [ ] Tested backend locally: `npm start`
- [ ] `npm install` works without errors
- [ ] package.json and package-lock.json committed

### Render Setup
- [ ] Render account created
- [ ] GitHub connected to Render
- [ ] Web service created
- [ ] Procfile verified (exists in backend folder)
- [ ] Environment variables added to Render
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`
- [ ] Deployment successful (logs show "Server running")

### After Deployment
- [ ] Health check passes: https://app.onrender.com/api/health
- [ ] Database connection successful (check logs)
- [ ] Frontend can reach backend (test in browser console)
- [ ] Login/registration works
- [ ] Database has created tables automatically
- [ ] JWT tokens are working

### For Frontend UI Update
- [ ] Update `api-service.js` with Render URL
- [ ] Upload to Hostinger via FTP/cPanel
- [ ] Clear browser cache (Ctrl+Shift+Del)
- [ ] Test all forms and buttons

---

## Environment Variables Reference

| Variable | Example | Purpose |
|----------|---------|---------|
| `NODE_ENV` | `production` | Sets production mode |
| `PORT` | `3000` | Server port (Render assigns automatically) |
| `DB_HOST` | `mysql.hostinger.com` | Hostinger MySQL host |
| `DB_PORT` | `3306` | MySQL port |
| `DB_USER` | `db123456_user` | MySQL username |
| `DB_PASSWORD` | `your_password` | MySQL password |
| `DB_NAME` | `db123456_lifeway` | Database name |
| `FRONTEND_URLS` | `https://your-domain.com` | Allowed frontend domains (comma-separated) |
| `JWT_SECRET` | `random_string_32_chars` | Signing key for JWT tokens |
| `SESSION_SECRET` | `random_string_32_chars` | Session encryption key |

---

## Security Tips

1. **Strong Secrets**
   ```bash
   # Generate JWT_SECRET
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Don't Commit .env**
   - `.gitignore` already includes it
   - Only commit `.env.example`

3. **Change Default Passwords**
   - Update all Hostinger MySQL passwords
   - Use strong 12+ character passwords
   - Don't reuse from other services

4. **Enable HTTPS**
   - Both Hostinger and Render use automatic HTTPS
   - Always use `https://` URLs, never `http://`

5. **Monitor Logs**
   - Check Render logs regularly
   - Look for suspicious login attempts
   - Monitor database errors

---

## Support & Help

### If Deployment Fails

1. Check Render logs (Service → Logs tab)
2. Look for the first error message
3. Common fixes:
   - Missing `Procfile` in backend folder
   - Wrong environment variables
   - MySQL not accessible
   - GitHub sync issue

### Connection String Format

If needed to configure elsewhere:
```
mysql://db123456_user:password@mysql.hostinger.com:3306/db123456_lifeway
```

### Testing Commands

```bash
# Test locally
npm start

# Test from Render
curl https://lifeway-backend.onrender.com/api/health

# Test API call  
curl -X POST https://lifeway-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"enrollmentNo":"test","password":"test"}'
```

---

## Next Steps

1. ✅ Setup Hostinger MySQL
2. ✅ Create `.env` file  
3. ✅ Push to GitHub
4. ✅ Deploy to Render
5. ✅ Update frontend API URL
6. ✅ Test everything works
7. ✅ Monitor logs for errors
8. ✅ Upgrade to Paid if needed (for always-on)

**Questions?** Read [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) for complete details!
