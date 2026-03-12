const pool = require('../config/database');
const { hashPassword, comparePassword, generateToken } = require('../utils/auth');
const { body, validationResult } = require('express-validator');

// Validation rules
const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
];

// Login
exports.login = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const connection = await pool.getConnection();

    // Check if user exists
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];

    // Verify password
    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) {
      connection.release();
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user is active
    if (user.status === 'inactive' || user.status === 'suspended') {
      connection.release();
      return res.status(403).json({ message: 'Your account is inactive or suspended. Please contact support.' });
    }

    // Update last login
    await connection.execute(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    // Get user details based on role
    let userData = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    if (user.role === 'student') {
      const [student] = await connection.execute(
        'SELECT id, first_name, last_name, mobile, photo_url FROM students WHERE user_id = ? LIMIT 1',
        [user.id]
      );
      if (student.length > 0) {
        userData = { ...userData, ...student[0] };
      }
    } else if (user.role === 'center') {
      const [center] = await connection.execute(
        'SELECT id, center_name, center_code, owner_name, phone FROM centers WHERE user_id = ? LIMIT 1',
        [user.id]
      );
      if (center.length > 0) {
        userData = { ...userData, ...center[0] };
      }
    } else if (user.role === 'staff') {
      const [staff] = await connection.execute(
        'SELECT id, first_name, last_name, position, department FROM staff WHERE user_id = ? LIMIT 1',
        [user.id]
      );
      if (staff.length > 0) {
        userData = { ...userData, ...staff[0] };
      }
    }

    connection.release();

    // Generate JWT token
    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    res.json({
      message: 'Login successful',
      token,
      user: userData,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Register Student
exports.registerStudent = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, mobile, dateOfBirth } = req.body;
    const connection = await pool.getConnection();

    // Check if email already exists
    const [existingUser] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      connection.release();
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user account
    const [userRes] = await connection.execute(
      'INSERT INTO users (email, password, role, status) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, 'student', 'active']
    );

    // Create student profile
    const studentRes = await connection.execute(
      'INSERT INTO students (user_id, first_name, last_name, mobile, date_of_birth, admission_date) VALUES (?, ?, ?, ?, ?, NOW())',
      [userRes.insertId, firstName, lastName, mobile, dateOfBirth || null]
    );

    connection.release();

    // Generate token
    const token = generateToken({ 
      id: userRes.insertId, 
      email, 
      role: 'student' 
    });

    res.status(201).json({
      message: 'Student registration successful',
      token,
      user: {
        id: userRes.insertId,
        email,
        role: 'student',
        first_name: firstName,
        last_name: lastName,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// Register Center
exports.registerCenter = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, centerName, ownerName, phone, city, state } = req.body;
    const connection = await pool.getConnection();

    // Check if email already exists
    const [existingUser] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      connection.release();
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user account
    const [userRes] = await connection.execute(
      'INSERT INTO users (email, password, role, status) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, 'center', 'active']
    );

    // Create center profile
    await connection.execute(
      'INSERT INTO centers (user_id, center_name, owner_name, phone, city, state, affiliation_date, affiliation_status) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)',
      [userRes.insertId, centerName, ownerName, phone, city, state, 'pending']
    );

    connection.release();

    // Generate token
    const token = generateToken({ 
      id: userRes.insertId, 
      email, 
      role: 'center' 
    });

    res.status(201).json({
      message: 'Center registration successful. Awaiting approval.',
      token,
      user: {
        id: userRes.insertId,
        email,
        role: 'center',
        center_name: centerName,
      },
    });
  } catch (error) {
    console.error('Center registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    // In JWT, logout is typically handled on the client side by clearing the token
    // We can also maintain a blacklist if needed
    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ message: 'Logout failed', error: error.message });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }

    const connection = await pool.getConnection();

    // Get user
    const [users] = await connection.execute(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify old password
    const passwordMatch = await comparePassword(oldPassword, users[0].password);
    if (!passwordMatch) {
      connection.release();
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await connection.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    connection.release();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Failed to change password', error: error.message });
  }
};

exports.loginValidation = loginValidation;
exports.registerValidation = registerValidation;
