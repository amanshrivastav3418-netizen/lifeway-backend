const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middleware/auth');
const pool = require('../config/database');

// Get all centers (admin)
router.get('/', verifyToken, verifyRole('super_admin'), async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [centers] = await connection.execute(
      'SELECT * FROM centers ORDER BY created_at DESC'
    );
    connection.release();

    res.json({
      message: 'Centers retrieved',
      count: centers.length,
      data: centers,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve centers', error: error.message });
  }
});

// Get my center (center user)
router.get('/my-center', verifyToken, verifyRole('center'), async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [centers] = await connection.execute(
      'SELECT * FROM centers WHERE user_id = ? LIMIT 1',
      [req.user.id]
    );

    if (centers.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Center not found' });
    }

    const centerId = centers[0].id;

    // Get students enrolled through this center
    const [students] = await connection.execute(
      'SELECT COUNT(*) as count FROM students WHERE id IN (SELECT student_id FROM enrollments) LIMIT 100'
    );

    connection.release();

    res.json({
      message: 'Center retrieved',
      data: centers[0],
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve center', error: error.message });
  }
});

// Update center details
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { ownerName, phone, address, city, state } = req.body;
    const connection = await pool.getConnection();

    await connection.execute(
      'UPDATE centers SET owner_name = ?, phone = ?, address = ?, city = ?, state = ? WHERE id = ?',
      [ownerName, phone, address, city, state, id]
    );

    connection.release();
    res.json({ message: 'Center updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update center', error: error.message });
  }
});

// Approve/Reject affiliation (admin only)
router.put('/:id/affiliation', verifyToken, verifyRole('super_admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const connection = await pool.getConnection();

    await connection.execute(
      'UPDATE centers SET affiliation_status = ?, affiliation_date = NOW() WHERE id = ?',
      [status, id]
    );

    connection.release();
    res.json({ message: `Affiliation ${status} successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update affiliation', error: error.message });
  }
});

module.exports = router;
