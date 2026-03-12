const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middleware/auth');
const pool = require('../config/database');

// Get all enrollments (admin)
router.get('/', verifyToken, verifyRole('super_admin'), async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [enrollments] = await connection.execute(
      `SELECT e.*, s.first_name, s.last_name, c.course_name 
       FROM enrollments e 
       JOIN students s ON e.student_id = s.id 
       JOIN courses c ON e.course_id = c.id 
       ORDER BY e.enrollment_date DESC`
    );
    connection.release();

    res.json({
      message: 'Enrollments retrieved',
      count: enrollments.length,
      data: enrollments,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve enrollments', error: error.message });
  }
});

// Get enrollment by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    const [enrollments] = await connection.execute(
      `SELECT e.*, s.first_name, s.last_name, c.course_name 
       FROM enrollments e 
       JOIN students s ON e.student_id = s.id 
       JOIN courses c ON e.course_id = c.id 
       WHERE e.id = ?`,
      [id]
    );

    connection.release();

    if (enrollments.length === 0) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    res.json({ message: 'Enrollment retrieved', data: enrollments[0] });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve enrollment', error: error.message });
  }
});

// Update enrollment status
router.put('/:id', verifyToken, verifyRole('super_admin', 'staff'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, marksObtained } = req.body;
    const connection = await pool.getConnection();

    await connection.execute(
      'UPDATE enrollments SET status = ?, marks_obtained = ? WHERE id = ?',
      [status, marksObtained || null, id]
    );

    connection.release();
    res.json({ message: 'Enrollment updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update enrollment', error: error.message });
  }
});

// Delete enrollment
router.delete('/:id', verifyToken, verifyRole('super_admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    await connection.execute('DELETE FROM enrollments WHERE id = ?', [id]);
    connection.release();

    res.json({ message: 'Enrollment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete enrollment', error: error.message });
  }
});

module.exports = router;
