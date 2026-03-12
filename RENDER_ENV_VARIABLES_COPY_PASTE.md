# 🔧 COPY-PASTE ENVIRONMENT VARIABLES FOR RENDER

**Location**: Render Dashboard → Your Service → Environment Tab

---

## How to Add:

1. Go to: https://dashboard.render.com
2. Select your service: `lifeway-backend`
3. Go to **Environment** section
4. Click **"Add Environment Variable"** for EACH line below
5. Copy the KEY and VALUE exactly
6. Click **Save**

---

## COPY EACH LINE BELOW:

### Line 1:
```
KEY: NODE_ENV
VALUE: production
```

### Line 2:
```
KEY: PORT
VALUE: 3000
```

### Line 3:
```
KEY: DB_HOST
VALUE: mysql.hostinger.com
```

### Line 4:
```
KEY: DB_PORT
VALUE: 3306
```

### Line 5:
```
KEY: DB_USER
VALUE: u790215710_lifeway_user
```

### Line 6:
```
KEY: DB_PASSWORD
VALUE: Lifeway@2026
```

### Line 7:
```
KEY: DB_NAME
VALUE: u790215710_lifewaycompute
```

### Line 8:
```
KEY: JWT_SECRET
VALUE: d55763ddea99a11bfa473c88efbb168ce52255c49cf296f5ba0908852490be9b
```

### Line 9:
```
KEY: SESSION_SECRET
VALUE: 2bddada3eadec0ca250dbeb54faf523c483f43372ca9629c986eac472735f13f
```

### Line 10:
```
KEY: FRONTEND_URLS
VALUE: https://lifewaycomputer.org,http://localhost:3000,http://localhost:5000
```

### Line 11:
```
KEY: DB_WAIT_FOR_CONNECTIONS
VALUE: true
```

### Line 12:
```
KEY: DB_CONNECTION_LIMIT
VALUE: 10
```

### Line 13:
```
KEY: DB_QUEUE_LIMIT
VALUE: 0
```

### Line 14:
```
KEY: DB_ENABLE_KEEP_ALIVE
VALUE: true
```

### Line 15:
```
KEY: DB_KEEP_ALIVE_INITIAL_DELAY_MS
VALUE: 0
```

---

## ✅ VERIFICATION

After adding all 15 variables:
- [ ] All 15 variables added
- [ ] No typos
- [ ] VALUES copied exactly
- [ ] Click "Save" after last variable

Then click **"Create Web Service"**

---

**⏱️ Deployment will take 2-3 minutes**
