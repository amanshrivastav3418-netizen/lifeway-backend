# ⚡ RENDER DEPLOYMENT - QUICK REFERENCE CARD

**Print this page or bookmark it!**

---

## 🎯 WHAT YOU'RE DOING

Deploying your Lifeway Backend from GitHub to Render.com (FREE tier)

---

## 🔗 KEY LINKS

| Link | Purpose |
|------|---------|
| https://render.com/register | Create Render account |
| https://dashboard.render.com | Render control panel |
| https://github.com/amanshrivastav3418-netizen/lifeway-backend | Your code on GitHub |
| https://lifewaycomputer.org | Your frontend site |

---

## ✅ 3-STEP QUICK DEPLOYMENT

### STEP 1: Create Render Account & Service (5 min)
```
1. Go to: https://render.com/register
2. Create account (or sign in)
3. Go to: https://dashboard.render.com
4. Click: "New +" → "Web Service"
5. Connect GitHub → Select: lifeway-backend
```

### STEP 2: Configure & Add Variables (5 min)
```
Name:              lifeway-backend
Environment:       Node
Build:             npm install
Start:             npm start

THEN Add 15 Environment Variables:
(Use file: RENDER_ENV_VARIABLES_COPY_PASTE.md)

NODE_ENV=production
PORT=3000
DB_HOST=mysql.hostinger.com
... (13 more lines)
```

### STEP 3: Deploy & Test (5 min)
```
1. Click: "Create Web Service"
2. Wait for status to show: "Live" (green)
3. Copy your Render URL
4. Test: https://your-url.onrender.com/api/health
5. Should show JSON response ✓
```

---

## 🔄 PREPARE FRONTEND (After deployment)

```bash
# Edit /api-service.js
# Replace YOUR_URL with your Render URL:

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api' 
  : 'https://YOUR_URL.onrender.com/api';

# Upload to Hostinger
# Test: https://lifewaycomputer.org (click Login)
```

**Or run automated script:**
```bash
node update-api-service.js
```

---

## 🚨 CRITICAL POINTS

✓ Add ALL 15 environment variables (not 14, not 13)  
✓ Copy values EXACTLY (no extra spaces)  
✓ Plan = Free (not Standard)  
✓ Region = AWS Frankfurt or Ohio  
✓ Wait for "Live" status before testing  
✓ Update api-service.js AFTER deployment  
✓ Upload to Hostinger IMMEDIATELY after  

---

## ⏰ EXPECTED TIMELINE

| Step | Time |
|------|------|
| Create account | 2 min |
| Create service | 2 min |
| Add variables | 3 min |
| Build & deploy | 3 min |
| Test health | 1 min |
| Update API | 2 min |
| Upload & test | 2 min |
| **TOTAL** | **~15 min** |

---

## ✅ VERIFICATION CHECKLIST

After deployment, verify:

```
✓ Render shows: "Live" (green status)
✓ Health check works: https://your-url.onrender.com/api/health
✓ API URL in api-service.js updated
✓ File uploaded to Hostinger
✓ Frontend login works
✓ Student list loads
✓ No console errors (F12)
```

---

## 🆘 TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| Render shows 502 | Check logs - database connection issue |
| CORS errors | Verify FRONTEND_URLS variable |
| Login fails | Check api-service.js has correct URL |
| Health check fails | Wait 30 sec, then refresh |
| Deploy takes long | Normal - npm install takes time |

---

## 📁 YOUR FILES

| File | Purpose |
|------|---------|
| render-deploy-guide.js | Complete deployment walkthrough |
| RENDER_ENV_VARIABLES_COPY_PASTE.md | Copy-paste environment variables |
| update-api-service.js | Auto-update api-service.js |
| RENDER_DEPLOYMENT_INSTRUCTIONS.md | Detailed reference guide |

---

## 🎬 ACTION NOW

1. **Create Render Account**: https://render.com/register
2. **Go to Dashboard**: https://dashboard.render.com  
3. **Create Web Service** with GitHub repository
4. **Add 15 Environment Variables** (copy from file)
5. **Deploy** and wait for "Live"
6. **Update api-service.js** with Render URL
7. **Upload to Hostinger**
8. **Test Login**

---

## 💬 HELP

- Questions? → RENDER_DEPLOYMENT_INSTRUCTIONS.md
- Need guidance? → node render-deploy-guide.js
- Copy variables? → RENDER_ENV_VARIABLES_COPY_PASTE.md
- Auto-update API? → node update-api-service.js

---

**🚀 Ready? Go to https://dashboard.render.com now!**
