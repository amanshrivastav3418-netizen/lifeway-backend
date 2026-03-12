# Lifeway Computers - Institute Management System

A comprehensive web application for managing computer education institute operations, including student enrollment, course management, certifications, and admin dashboards.

## 🎯 Features

### Student Features
- ✅ User registration and login
- ✅ Profile management
- ✅ Course browsing and enrollment
- ✅ Dashboard with enrollments and progress
- ✅ Document download and verification
- ✅ ID card generation

### Center/Franchise Features
- ✅ Center registration and login
- ✅ Student management
- ✅ Enrollment tracking
- ✅ Affiliation status monitoring
- ✅ Operations dashboard

### Staff Features
- ✅ Staff login and dashboard
- ✅ Student management
- ✅ Document verification
- ✅ Enrollment management
- ✅ Activity tracking

### Admin Features
- ✅ Super admin dashboard
- ✅ User management (students, staff, centers)
- ✅ Course management (CRUD)
- ✅ Affiliation approval system
- ✅ Document verification
- ✅ System analytics and reports
- ✅ Activity logs

### General Features
- ✅ Multi-language support (English, Hindi)
- ✅ Responsive design for mobile and desktop
- ✅ Secure authentication with JWT
- ✅ Password hashing with bcrypt
- ✅ Role-based access control
- ✅ Document verification system
- ✅ QR code generation for ID cards
- ✅ PDF generation for certificates

## 🔧 Technology Stack

### Frontend
- HTML5
- CSS3 (Tailwind CSS)
- Vanilla JavaScript (ES6+)
- Font Awesome Icons

### Backend
- Node.js
- Express.js
- MySQL 2 (for MySQL connection pooling)
- JWT (JSON Web Tokens)
- bcryptjs (Password hashing)

### Database
- MySQL 5.7+
- Hostinger MySQL compatible

## 📁 Project Structure

```
lifeway ka backend/
├── index.html                 # Main HTML file
├── style.css                  # Global styles
├── api-service.js             # API communication layer
├── script.js                  # Main JavaScript functionality
│
├── backend/                   # Node.js Backend
│   ├── server.js              # Express server entry point
│   ├── package.json           # Dependencies
│   ├── .env.example           # Environment template
│   │
│   ├── config/
│   │   └── database.js        # MySQL connection
│   │
│   ├── middleware/
│   │   └── auth.js            # JWT authentication middleware
│   │
│   ├── utils/
│   │   └── auth.js            # Password hashing & JWT utilities
│   │
│   ├── controllers/
│   │   ├── authController.js  # Authentication logic
│   │   ├── studentController.js
│   │   ├── courseController.js
│   │   └── ...
│   │
│   ├── routes/
│   │   ├── auth.js
│   │   ├── students.js
│   │   ├── courses.js
│   │   ├── enrollments.js
│   │   ├── centers.js
│   │   ├── staff.js
│   │   ├── documents.js
│   │   └── dashboard.js
│   │
│   ├── models/
│   │   └── database.js        # Database schema initialization
│   │
│   └── uploads/               # File uploads directory
│
└── DEPLOYMENT_GUIDE.md        # Hostinger deployment instructions
```

## 🚀 Getting Started

### Prerequisites
- Node.js v14+ 
- npm v6+
- MySQL 5.7+
- Modern web browser

### Local Setup

1. **Clone/Download the project**
```bash
cd "lifeway ka backend"
cd backend
```

2. **Install backend dependencies**
```bash
npm install
```

3. **Create .env file**
```bash
cp .env.example .env
```

4. **Configure .env with your MySQL details**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=lifeway_computers
DB_PORT=3306
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key_here
```

5. **Start MySQL server**
```bash
# Windows
net start MySQL80

# Mac
brew services start mysql

# Linux
sudo service mysql start
```

6. **Run the backend**
```bash
npm run dev
```
The backend will start on `http://localhost:5000`

7. **Open frontend**
Open `index.html` in a web browser or serve it using a local server:
```bash
# Using Python
python -m http.server 8000

# Using Node http-server
npm install -g http-server
http-server
```

## 📚 API Documentation

### Authentication Endpoints

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Register Student
```
POST /api/auth/register-student
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "mobile": "9876543210",
  "dateOfBirth": "2000-01-15"
}
```

#### Register Center
```
POST /api/auth/register-center
Content-Type: application/json

{
  "email": "center@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "centerName": "Lifeway Center",
  "ownerName": "John",
  "phone": "9876543210",
  "city": "Delhi",
  "state": "Delhi"
}
```

### Course Endpoints

#### Get All Courses
```
GET /api/courses?category=Computer
```

#### Get Course by ID
```
GET /api/courses/:id
```

#### Enroll in Course
```
POST /api/courses/enroll
Authorization: Bearer <token>
Content-Type: application/json

{
  "courseId": 1
}
```

### Student Endpoints

#### Get My Profile
```
GET /api/students/profile/me
Authorization: Bearer <token>
```

#### Update Profile
```
PUT /api/students/profile/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "mobile": "9876543210",
  "address": "Address"
}
```

### Dashboard Endpoints

#### Student Dashboard
```
GET /api/dashboard/student
Authorization: Bearer <token>
```

#### Admin Dashboard
```
GET /api/dashboard/admin
Authorization: Bearer <token>
```

## 🔐 Authentication

### How It Works

1. User submits login credentials
2. Backend verifies email/password
3. If valid, JWT token is generated
4. Token is stored in localStorage
5. All subsequent requests include token in Authorization header
6. Backend validates token for protected routes

### Default Admin Account

When the database is initialized, a default admin account is created:
- **Email**: admin@lifeway.com
- **Password**: admin@123
- ⚠️ **CHANGE THIS IMMEDIATELY IN PRODUCTION**

## 📊 Database Schema

### Users Table
Primary authentication for all user types.

### Students Table
Student profile and enrollment tracking.

### Courses Table
Available courses with pricing and duration.

### Enrollments Table
Student-Course relationships with progress.

### Centers Table
Franchise/affiliated center management.

### Staff Table
Staff member information.

### Documents Table
Student certificates, ID cards, mark sheets.

### Activity Logs Table
System audit trail for security.

## 🛠️ Customization

### Add New Course Category
1. Edit category list in `courseController.js`
2. Update category dropdown in HTML
3. Database will auto-create when course is added

### Customize Colors
Edit CSS variables in `style.css`:
```css
:root {
  --primary: #0878f7;
  --accent: #ff6b00;
  --success: #28a745;
  --danger: #dc2626;
  --dark: #1a1c23;
  --light: #f5f5f5;
}
```

### Add New User Role
1. Update `role` enum in database.js
2. Add route in relevant controller
3. Create corresponding middleware verification

## 🐛 Troubleshooting

### "Cannot find module 'mysql2'"
```bash
npm install mysql2
```

### "ECONNREFUSED: Connection refused"
- Check MySQL is running
- Verify DB_HOST is correct in .env

### "ERRTOKENEXPIRED"
- Token has expired, user needs to login again
- Check JWT_EXPIRE setting

### "EADDRINUSE: Port already in use"
Change PORT in .env or kill process on that port

## 📱 Features in Detail

### Student Dashboard
- View enrolled courses with progress
- Download certificates and documents
- Update profile information
- Track academic performance

### Admin Dashboard
- Real-time statistics
- User management
- Course management
- Affiliation requests
- Activity monitoring

### Document Verification
- Public verification endpoint
- QR code verification
- Document status tracking

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs with salt rounds
- **Rate Limiting**: Protection against brute force attacks
- **CORS Protection**: Cross-origin request controls
- **SQL Injection Prevention**: Parameterized queries
- **Environment Variables**: Sensitive data protection
- **HTTPS**: Encrypted communication (production)

## 📈 Performance Optimization

- Database connection pooling
- Entity relationship optimization
- Caching strategies for static content
- Lazy loading for images
- Minified CSS and JavaScript

## 🌐 Deployment

For complete deployment instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

### Quick Deploy to Hostinger
1. Follow DEPLOYMENT_GUIDE.md steps
2. Upload backend to Hostinger
3. Configure MySQL credentials
4. Update API_BASE_URL in api-service.js
5. Deploy frontend to public_html
6. Start backend with PM2

## 📞 Support & Contact

For issues, enhancements, or support:
- Check DEPLOYMENT_GUIDE.md
- Review console logs for errors
- Verify database connections
- Check API endpoints with curl

## 📄 License

This project is proprietary to Lifeway Computers.

## 👥 Contributors

- Lifeway Computers Development Team

## 🎉 Features Coming Soon

- [ ] Email notifications
- [ ] SMS alerts for admissions
- [ ] Advanced reporting and analytics
- [ ] Mobile app (React Native)
- [ ] Video tutorial integration
- [ ] Online exam system
- [ ] Payment gateway integration
- [ ] WhatsApp integration for notifications
- [ ] Bulk student import/export
- [ ] Advanced document templates

---

**Version**: 1.0.0  
**Last Updated**: March 2024  
**Developed for**: Lifeway Computers Institute
