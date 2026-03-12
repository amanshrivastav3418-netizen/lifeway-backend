const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getAllStudents,
  getStudentById,
  getMyProfile,
  updateProfile,
  uploadPhoto,
  getEnrollments,
  deleteStudent,
} = require('../controllers/studentController');
const { verifyToken, verifyRole } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `student-${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Public routes
router.get('/:id', getStudentById);

// Protected routes
router.get('/profile/me', verifyToken, verifyRole('student'), getMyProfile);
router.put('/profile/me', verifyToken, verifyRole('student'), updateProfile);
router.post('/profile/photo', verifyToken, verifyRole('student'), upload.single('photo'), uploadPhoto);
router.get('/enrollments/my', verifyToken, verifyRole('student'), getEnrollments);

// Admin routes
router.get('/', verifyToken, verifyRole('super_admin'), getAllStudents);
router.delete('/:id', verifyToken, verifyRole('super_admin'), deleteStudent);

module.exports = router;
