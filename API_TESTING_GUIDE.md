# API Testing Guide - Lifeway Computers

## Testing with cURL

Use these commands to test the API endpoints. Replace the values with your actual data.

### 1. Health Check

```bash
curl -X GET http://localhost:5000/api/health
```

Expected Response:
```json
{"status": "Server is running", "timestamp": "2024-03-12T10:00:00Z"}
```

---

## Authentication Endpoints

### 2. Student Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123"
  }'
```

Expected Response:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "student@example.com",
    "role": "student",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

### 3. Register Student

```bash
curl -X POST http://localhost:5000/api/auth/register-student \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newstudent@example.com",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123",
    "firstName": "Jane",
    "lastName": "Smith",
    "mobile": "9876543210",
    "dateOfBirth": "2000-05-15"
  }'
```

### 4. Register Center

```bash
curl -X POST http://localhost:5000/api/auth/register-center \
  -H "Content-Type: application/json" \
  -d '{
    "email": "center@example.com",
    "password": "CenterPass123",
    "confirmPassword": "CenterPass123",
    "centerName": "Lifeway Delhi Center",
    "ownerName": "Rajesh Kumar",
    "phone": "9876543210",
    "city": "Delhi",
    "state": "Delhi"
  }'
```

### 5. Change Password

```bash
curl -X POST http://localhost:5000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "oldPassword": "password123",
    "newPassword": "newpass456",
    "confirmPassword": "newpass456"
  }'
```

---

## Course Endpoints

### 6. Get All Courses

```bash
curl -X GET http://localhost:5000/api/courses
```

With Category Filter:
```bash
curl -X GET "http://localhost:5000/api/courses?category=Computer&status=active"
```

### 7. Get Course by ID

```bash
curl -X GET http://localhost:5000/api/courses/1
```

### 8. Get Course Categories

```bash
curl -X GET http://localhost:5000/api/courses/categories
```

### 9. Create Course (Admin Only)

```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "courseName": "Advanced JavaScript",
    "courseCode": "JS-201",
    "category": "Computer",
    "description": "Learn advanced JavaScript concepts",
    "durationMonths": 3,
    "courseFee": 5000,
    "maxStudents": 50
  }'
```

### 10. Enroll in Course (Requires Authentication)

```bash
curl -X POST http://localhost:5000/api/courses/enroll \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer STUDENT_TOKEN" \
  -d '{
    "courseId": 1
  }'
```

---

## Student Endpoints

### 11. Get My Profile

```bash
curl -X GET http://localhost:5000/api/students/profile/me \
  -H "Authorization: Bearer STUDENT_TOKEN"
```

### 12. Update Profile

```bash
curl -X PUT http://localhost:5000/api/students/profile/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer STUDENT_TOKEN" \
  -d '{
    "firstName": "John",
    "lastName": "Smith",
    "mobile": "9876543210",
    "address": "123 Main Street",
    "city": "Delhi",
    "state": "Delhi",
    "postalCode": "110001"
  }'
```

### 13. Upload Student Photo

```bash
curl -X POST http://localhost:5000/api/students/profile/photo \
  -H "Authorization: Bearer STUDENT_TOKEN" \
  -F "photo=@/path/to/photo.jpg"
```

### 14. Get My Enrollments

```bash
curl -X GET http://localhost:5000/api/students/enrollments/my \
  -H "Authorization: Bearer STUDENT_TOKEN"
```

### 15. Get All Students (Admin Only)

```bash
curl -X GET http://localhost:5000/api/students \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## Enrollment Endpoints

### 16. Get All Enrollments (Admin Only)

```bash
curl -X GET http://localhost:5000/api/enrollments \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### 17. Get Enrollment by ID

```bash
curl -X GET http://localhost:5000/api/enrollments/1 \
  -H "Authorization: Bearer STUDENT_TOKEN"
```

### 18. Update Enrollment Status (Admin/Staff)

```bash
curl -X PUT http://localhost:5000/api/enrollments/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "status": "completed",
    "marksObtained": 85
  }'
```

---

## Document Endpoints

### 19. Get My Documents

```bash
curl -X GET http://localhost:5000/api/documents/my \
  -H "Authorization: Bearer STUDENT_TOKEN"
```

### 20. Verify Document (Public - No Auth Required)

```bash
curl -X GET "http://localhost:5000/api/documents/verify/DOC-2024-001"
```

### 21. Verify Document (Admin)

```bash
curl -X POST http://localhost:5000/api/documents/1/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "status": "verified"
  }'
```

---

## Center Endpoints

### 22. Get All Centers (Admin)

```bash
curl -X GET http://localhost:5000/api/centers \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### 23. Get My Center (Center User)

```bash
curl -X GET http://localhost:5000/api/centers/my-center \
  -H "Authorization: Bearer CENTER_TOKEN"
```

### 24. Update Center Details

```bash
curl -X PUT http://localhost:5000/api/centers/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer CENTER_TOKEN" \
  -d '{
    "ownerName": "Ramesh Kumar",
    "phone": "9876543210",
    "address": "Center Building",
    "city": "Delhi",
    "state": "Delhi"
  }'
```

### 25. Approve/Reject Affiliation (Admin)

```bash
curl -X PUT http://localhost:5000/api/centers/1/affiliation \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "status": "approved"
  }'
```

---

## Dashboard Endpoints

### 26. Student Dashboard

```bash
curl -X GET http://localhost:5000/api/dashboard/student \
  -H "Authorization: Bearer STUDENT_TOKEN"
```

### 27. Admin Dashboard

```bash
curl -X GET http://localhost:5000/api/dashboard/admin \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### 28. Center Dashboard

```bash
curl -X GET http://localhost:5000/api/dashboard/center \
  -H "Authorization: Bearer CENTER_TOKEN"
```

### 29. Staff Dashboard

```bash
curl -X GET http://localhost:5000/api/dashboard/staff \
  -H "Authorization: Bearer STAFF_TOKEN"
```

---

## Testing Notes

### Important Headers

Always include authorization header for protected routes:
```
Authorization: Bearer <your_jwt_token>
```

### Getting a Token

1. Call login endpoint
2. Copy the "token" value from response
3. Use it in the Authorization header

### Testing from Frontend

For testing from the frontend console:

```javascript
// Make an API call
fetch('http://localhost:5000/api/courses', {
  headers: {
    'Authorization': `Bearer ${apiService.getToken()}`
  }
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err))
```

### Response Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized (no token or invalid token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **500**: Server Error

---

## Using Postman

### Import Collection

1. Create a new Postman collection
2. Add these endpoints
3. Set environment variable: `token={{token}}`
4. Set environment variable: `baseUrl=http://localhost:5000/api`

### Sample Postman Pre-request Script

```javascript
// Run before login to get token
pm.sendRequest({
  url: "http://localhost:5000/api/auth/login",
  method: 'POST',
  header: {
    'Content-Type': 'application/json'
  },
  body: {
    mode: 'raw',
    raw: JSON.stringify({
      email: "student@example.com",
      password: "password123"
    })
  }
}, function (err, response) {
  if (!err) {
    var token = response.json().token;
    pm.environment.set("token", token);
  }
});
```

---

## Troubleshooting API Calls

### Connection Refused
- Ensure backend is running: `npm run dev`
- Check port: 5000

### Invalid Token
- Token may have expired (7 days default)
- Login again to get new token

### CORS Error
- This typically won't appear for same-origin requests
- If testing from different domain, ensure CORS is enabled in server.js

### Validation Errors
- Check request body format
- Ensure all required fields are included
- Check field values are valid types

---

**Last Updated**: March 2024
**API Version**: 1.0.0
