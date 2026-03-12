const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middleware/auth');
const pool = require('../config/database');

// Get user details (for any authenticated user)
router.get('/me', verifyToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [users] = await connection.execute(
      'SELECT id, email, role, status FROM users WHERE id = ?',
      [req.user.id]
    );
    connection.release();

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User retrieved', data: users[0] });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve user', error: error.message });
  }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { firstName, lastName, phone, address } = req.body;
    const userId = req.user.id;
    const connection = await pool.getConnection();

    // Update based on role
    if (req.user.role === 'student') {
      await connection.execute(
        'UPDATE students SET first_name = ?, last_name = ? WHERE user_id = ?',
        [firstName, lastName, userId]
      );
    } else if (req.user.role === 'staff') {
      await connection.execute(
        'UPDATE staff SET first_name = ?, last_name = ? WHERE user_id = ?',
        [firstName, lastName, userId]
      );
    }

    connection.release();
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
});

module.exports = router;
