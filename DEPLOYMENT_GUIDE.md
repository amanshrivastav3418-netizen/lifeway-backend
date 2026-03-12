# Lifeway Institute Management System - Deployment Guide

## Overview
This document provides step-by-step instructions for deploying the Lifeway Institute Management System on Hostinger hosting with a MySQL database.

## System Requirements

- **Node.js**: v14.0 or higher
- **MySQL**: 5.7 or higher (Hostinger MySQL)
- **npm**: v6.0 or higher
- **Disk Space**: 500MB minimum
- **RAM**: 512MB minimum

## Step 1: Prepare Your Hostinger Account

### 1.1 MySQL Database Setup

1. Log in to your Hostinger cPanel
2. Go to **MySQL Databases** or **phpMyAdmin**
3. Create a new database:
   - Database name: `lifeway_computers`
   - Database user: Create a new user (e.g., `lifeway_user`)
   - Generate a secure password
   - Note down: Host, Username, Database Name, Password

### 1.2 File Manager Setup

1. Connect to your hosting via FTP or File Manager
2. Create the directory structure:
   ```
   public_html/
   ├── backend/          (Node.js backend)
   ├── frontend/         (HTML/CSS files)
   └── .env              (Configuration file)
   ```

## Step 2: Deploy Backend

### 2.1 Upload Backend Files

1. Via FTP/File Manager:
   - Upload all files from `/backend` folder to `public_html/backend/`
   - Ensure folders created: `routes/, controllers/, models/, config/, middleware/, utils/, uploads/`

### 2.2 Install Dependencies

```bash
cd backend
npm install
```

### 2.3 Configure Environment Variables

Create `.env` file in the backend directory:

```env
# Database Configuration
DB_HOST=your_hostinger_mysql_host
DB_USER=lifeway_user
DB_PASSWORD=your_secure_password
DB_NAME=lifeway_computers
DB_PORT=3306

# Server Configuration
PORT=5000
NODE_ENV=production

# JWT Configuration
JWT_SECRET=your_very_secure_jwt_secret_key_minimum_32_chars
JWT_EXPIRE=7d

# bcrypt Configuration
BCRYPT_ROUNDS=10

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Frontend URL
FRONTEND_URL=https://yourdomain.com

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### 2.4 Start the Backend Service

**Using PM2 (Recommended for Hostinger):**

```bash
# Install PM2 globally
npm install -g pm2

# Start the server
pm2 start server.js --name "lifeway-backend"

# Make it auto-restart on reboot
pm2 startup
pm2 save
```

**Or using Node directly:**
```bash
node server.js
```

## Step 3: Configure Frontend

### 3.1 Update API URL

Edit `api-service.js` in your frontend directory:

```javascript
// Change this line:
const API_BASE_URL = 'http://localhost:5000/api';

// To your production URL:
const API_BASE_URL = 'https://yourdomain.com:5000/api';
// OR if using a reverse proxy:
const API_BASE_URL = 'https://yourdomain.com/api';
```

### 3.2 Upload Frontend Files

1. Upload all frontend files (HTML, CSS, JS) to `public_html/`
2. Ensure `api-service.js` and `script.js` are in the root directory

## Step 4: Create Reverse Proxy (Nginx/Apache)

### For Hostinger cPanel with Nginx:

Edit your nginx configuration or use cPanel to add:

```nginx
location /api {
    proxy_pass http://localhost:5000/api;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### For Apache (using .htaccess):

Create or update `.htaccess` in your backend directory:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    # Forward all requests to Node server
    RewriteRule ^api/(.*)$ http://localhost:5000/api/$1 [P,L]
</IfModule>
```

## Step 5: Database Initialization

The backend will automatically initialize the database on first run:

1. Start the backend server
2. Visit: `https://yourdomain.com/api/health` to verify it's running
3. Check Hostinger MySQL to confirm tables are created

### Default Admin Account:
- **Email**: admin@lifeway.com
- **Password**: admin@123
- ⚠️ **IMMEDIATELY CHANGE** this password in production!

## Step 6: SSL Certificate Setup

1. Ensure your Hostinger plan includes free SSL (Let's Encrypt)
2. Go to cPanel → SSL/TLS
3. Install a free SSL certificate for your domain
4. Update API_BASE_URL to use `https://`

## Step 7: Testing Deployment

### 7.1 Test Backend Health Check
```bash
curl https://yourdomain.com/api/health
```

Expected response:
```json
{"status": "Server is running", "timestamp": "2024-03-12T10:00:00Z"}
```

### 7.2 Test Database Connection
```bash
# Check that tables exist in MySQL
SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'lifeway_computers';
```

### 7.3 Test Login Functionality
1. Visit frontend homepage
2. Navigate to login
3. Try login with: admin@lifeway.com / admin@123
4. Should redirect to dashboard

## Step 8: Performance Optimization

### 8.1 Enable Caching
Update `.htaccess`:
```apache
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
</IfModule>
```

### 8.2 Gzip Compression
```apache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>
```

### 8.3 Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_enrollment_student ON enrollments(student_id);
CREATE INDEX idx_enrollment_course ON enrollments(course_id);
CREATE INDEX idx_document_student ON documents(student_id);
```

## Step 9: Database Backup

### Automated Backups

Create a backup script (`backup.js`):
```javascript
const backup = require('mysqldump');
const fs = require('fs');

backup({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dest: `./backups/backup-${Date.now()}.sql`
}).then(() => {
  console.log('Backup completed');
}).catch(err => {
  console.error('Backup failed:', err);
});
```

Run daily with cron:
```bash
0 2 * * * cd /path/to/backend && node backup.js
```

## Step 10: Monitoring and Maintenance

### Watch Server Logs
```bash
pm2 logs lifeway-backend

# Or in real-time
pm2 logs lifeway-backend --lines 100 --stream
```

### Monitor Server Resources
```bash
pm2 monit
```

### Restart on Crash
PM2 automatically restarts crashed processes (configured in step 2.4)

## Step 11: Security Checklist

- [ ] Change admin password immediately
- [ ] Update JWT_SECRET to a complex 32+ character string
- [ ] Enable HTTPS/SSL certificate
- [ ] Set NODE_ENV=production
- [ ] Hide .env file (not publicly accessible)
- [ ] Implement rate limiting (already in code)
- [ ] Regular database backups (daily)
- [ ] Monitor error logs regularly
- [ ] Keep Node.js and npm updated
- [ ] Use strong, unique database password

## Troubleshooting

### Issue: "Cannot connect to database"
**Solution:**
1. Verify credentials in `.env`
2. Check if MySQL service is running
3. Ensure database user has correct privileges:
   ```sql
   GRANT ALL PRIVILEGES ON lifeway_computers.* TO 'lifeway_user'@'localhost';
   ```

### Issue: "API requests failing with 404"
**Solution:**
1. Verify backend is running: `pm2 list`
2. Check correct port (5000) is being used
3. Verify API_BASE_URL in api-service.js

### Issue: "CORS errors in browser"
**Solution:**
Update CORS settings in `server.js`:
```javascript
const cors = require('cors');
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true,
}));
```

### Issue: "File uploads not working"
**Solution:**
1. Ensure `/uploads` folder exists and is writable: `chmod 775 uploads/`
2. Check file size limit in .env (MAX_FILE_SIZE)

## Scaling Considerations

### As you grow:
1. **Use Load Balancer** (Hostinger Business plan)
2. **Database Optimization** - Add more indexes
3. **Redis Caching** - For session management
4. **CDN** - For static files
5. **Database Replication** - For high availability

## Support & Maintenance

- **GitHub**: Document your deployment steps
- **Logs Location**: `/root/.pm2/logs/`
- **Database Backups**: Keep encrypted backups offsite
- **Update Schedule**: Monthly security patches

## Environment Variables Summary

| Variable | Purpose | Example |
|----------|---------|---------|
| DB_HOST | MySQL host | sql.hostinger.com |
| DB_USER | MySQL username | lifeway_user |
| DB_PASSWORD | MySQL password | SecurePassword123! |
| DB_NAME | Database name | lifeway_computers |
| PORT | Backend port | 5000 |
| NODE_ENV | Environment | production |
| JWT_SECRET | JWT signing key | your-secret-key-here |
| FRONTEND_URL | Frontend domain | https://yourdomain.com |

---

**Last Updated**: March 2024
**Version**: 1.0.0
**Author**: Lifeway Computers
