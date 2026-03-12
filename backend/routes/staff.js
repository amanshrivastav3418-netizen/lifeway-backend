const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middleware/auth');
const pool = require('../config/database');

// Get all staff (admin)
router.get('/', verifyToken, verifyRole('super_admin'), async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [staff] = await connection.execute(
      'SELECT s.*, u.email FROM staff s JOIN users u ON s.user_id = u.id ORDER BY s.hire_date DESC'
    );
    connection.release();

    res.json({
      message: 'Staff retrieved',
      count: staff.length,
      data: staff,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve staff', error: error.message });
  }
});

// Get staff by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    const [staff] = await connection.execute(
      'SELECT s.*, u.email FROM staff s JOIN users u ON s.user_id = u.id WHERE s.id = ?',
      [id]
    );

    connection.release();

    if (staff.length === 0) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    res.json({ message: 'Staff retrieved', data: staff[0] });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve staff', error: error.message });
  }
});

// Update staff details
router.put('/:id', verifyToken, verifyRole('super_admin', 'staff'), async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, position, department, phone } = req.body;
    const connection = await pool.getConnection();

    await connection.execute(
      'UPDATE staff SET first_name = ?, last_name = ?, position = ?, department = ?, phone = ? WHERE id = ?',
      [firstName, lastName, position, department, phone, id]
    );

    connection.release();
    res.json({ message: 'Staff updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update staff', error: error.message });
  }
});

// Delete staff
router.delete('/:id', verifyToken, verifyRole('super_admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    const [staff] = await connection.execute('SELECT user_id FROM staff WHERE id = ?', [id]);

    if (staff.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Staff member not found' });
    }

    await connection.execute('DELETE FROM users WHERE id = ?', [staff[0].user_id]);
    connection.release();

    res.json({ message: 'Staff deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete staff', error: error.message });
  }
});

module.exports = router;
