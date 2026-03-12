# QUICKSTART GUIDE - Lifeway Computers

## 🚀 Get Running in 5 Minutes

### Prerequisites
- Node.js v14+ installed
- MySQL running locally or access to Hostinger MySQL
- A code editor (VS Code recommended)

---

## Step 1: Backend Setup (2 minutes)

```bash
# Navigate to backend directory
cd "lifeway ka backend/backend"

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

### Edit `.env` file with your MySQL details:

**For Local Development:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=lifeway_computers
PORT=5000
NODE_ENV=development
JWT_SECRET=dev-secret-key-change-me
```

**For Hostinger (Production):**
```env
DB_HOST=sql.hostinger.com
DB_USER=your_cpanel_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
PORT=5000
NODE_ENV=production
JWT_SECRET=your-very-secure-secret-key-minimum-32-chars
```

---

## Step 2: Start the Backend (1 minute)

```bash
# Development mode with auto-reload
npm run dev

# OR Production mode
npm start
```

You should see:
```
✓ MySQL Database connected successfully
✓ Database initialized successfully
📚 Lifeway Backend Server running on port 5000
Health check: http://localhost:5000/api/health
```

---

## Step 3: Test Backend (1 minute)

Open browser or terminal:

```bash
# Test health check
curl http://localhost:5000/api/health

# Or in browser
http://localhost:5000/api/health
```

Expected response:
```json
{"status": "Server is running"}
```

---

## Step 4: Open Frontend (1 minute)

1. Open `index.html` in your browser
2. Or serve locally:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node
   npx http-server
   ```

Visit: `http://localhost:8000`

---

## 🔐 Default Login Credentials

**Email**: admin@lifeway.com  
**Password**: admin@123

⚠️ Change this immediately!

---

## ✨ Quick Testing Workflow

### 1. Test Student Registration
- Click "Home"
- Scroll to login section
- Click "Register as Student"  
- Fill form and submit
- Should see success message

### 2. Test Student Login
- After registration, login with your credentials
- Should see student dashboard
- View enrollments and profile

### 3. Test Course Enrollment
- Navigate to "Courses"
- Click "Enroll Now" on any course
- Check dashboard to verify enrollment

### 4. Test Admin Panel
- Login with admin credentials
- Navigate to "Super Admin" dashboard
- View system statistics

---

## 🛠️ Common Commands

```bash
# Start development server with hot reload
npm run dev

# Start production server
npm start

# Install a new package
npm install packagename

# View server logs
pm2 logs

# Stop the server
Ctrl + C (in terminal)
```

---

## 📊 Verify Everything Works

Check these to ensure success:

- ✅ Backend runs without errors
- ✅ Health check returns JSON
- ✅ Frontend loads in browser
- ✅ Can navigate between pages
- ✅ Login form appears
- ✅ Can login with admin@lifeway.com

---

## 🚨 Troubleshooting

### "Cannot connect to database"
```bash
# Windows: Ensure MySQL is running
net start MySQL80

# Mac: Start MySQL
brew services start mysql

# Linux: Start MySQL
sudo service mysql start

# Then check credentials in .env
```

### "Port 5000 already in use"
```bash
# Change PORT in .env to 5001 or 5002
# Or kill the process using port 5000

# Windows
netstat -ano | findstr :5000

# Mac/Linux
lsof -i :5000
```

### "api-service.js not found"
Ensure `api-service.js` is in same directory as `index.html`

---

## 📝 Next Steps

1. **For Production**: Read [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
2. **For API Testing**: See [API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md)
3. **For Details**: Read [README.md](./README.md)
4. **For Overview**: Check [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

---

## 📱 Access Points

| Resource | URL | Purpose |
|----------|-----|---------|
| Frontend | http://localhost:8000 | Main website |
| Backend API | http://localhost:5000/api | API endpoint |
| Health Check | http://localhost:5000/api/health | Server status |
| Database | localhost:3306 | MySQL connection |

---

## 🎯 What Works Out of the Box

✅ Complete authentication system  
✅ Student registration and profile  
✅ Course browsing and enrollment  
✅ Admin dashboard with stats  
✅ Document management  
✅ Center/Franchise registration  
✅ Staff management  
✅ Role-based access control  
✅ Responsive design  
✅ Form validation  

---

## 💡 Pro Tips

1. **Use VS Code's REST Client extension** to test APIs
2. **Check browser console** (F12) for errors
3. **Check backend logs** for server-side issues
4. **Use Postman** for complex API testing
5. **Keep .env file secure** - never commit it

---

## 🔒 Security Reminders

- [ ] Change admin@lifeway.com password
- [ ] Update JWT_SECRET in .env
- [ ] Use strong MySQL password
- [ ] Enable HTTPS in production
- [ ] Configure CORS properly
- [ ] Regular database backups

---

## 📞 Stuck?

1. Check [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for troubleshooting
2. Review [API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md) for endpoint examples
3. Check server logs: `npm run dev` shows all output
4. Check browser console (F12) for client-side errors
5. Verify .env configuration

---

## ✅ Verification Checklist

After setup, verify these work:

- [ ] Backend starts without errors
- [ ] Health check returns 200
- [ ] Frontend loads completely
- [ ] Navigation works (buttons switch pages)
- [ ] Login form is visible
- [ ] Can login with admin credentials
- [ ] Dashboard displays data
- [ ] Can view courses

---

## 🎉 You're All Set!

Your Lifeway Computers system is now running locally and ready for testing or deployment to Hostinger.

**Next**: Read the detailed guides for production deployment.

---

**Happy Coding! 🚀**

*Last Updated: March 2024*
