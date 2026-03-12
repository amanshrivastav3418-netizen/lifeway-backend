const express = require('express');
const router = express.Router();
const {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseCategories,
  enrollCourse,
} = require('../controllers/courseController');
const { verifyToken, verifyRole } = require('../middleware/auth');

// Public routes
router.get('/categories', getCourseCategories);
router.get('/', getAllCourses);
router.get('/:id', getCourseById);

// Protected routes
router.post('/enroll', verifyToken, verifyRole('student'), enrollCourse);

// Admin routes
router.post('/', verifyToken, verifyRole('super_admin'), createCourse);
router.put('/:id', verifyToken, verifyRole('super_admin'), updateCourse);
router.delete('/:id', verifyToken, verifyRole('super_admin'), deleteCourse);

module.exports = router;
