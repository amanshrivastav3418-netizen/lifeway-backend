const express = require('express');
const router = express.Router();
const { 
  login, 
  registerStudent, 
  registerCenter, 
  logout, 
  changePassword,
  loginValidation,
  registerValidation 
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// Public routes
router.post('/login', loginValidation, login);
router.post('/register-student', registerValidation, registerStudent);
router.post('/register-center', registerValidation, registerCenter);
router.post('/logout', logout);

// Protected routes
router.post('/change-password', verifyToken, changePassword);

module.exports = router;
