const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middleware/auth');
const pool = require('../config/database');

// Get student documents
router.get('/my', verifyToken, verifyRole('student'), async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [students] = await connection.execute(
      'SELECT id FROM students WHERE user_id = ? LIMIT 1',
      [req.user.id]
    );

    if (students.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Student not found' });
    }

    const [documents] = await connection.execute(
      'SELECT * FROM documents WHERE student_id = ? ORDER BY created_at DESC',
      [students[0].id]
    );

    connection.release();

    res.json({
      message: 'Documents retrieved',
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve documents', error: error.message });
  }
});

// Get document by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    const [documents] = await connection.execute(
      'SELECT * FROM documents WHERE id = ?',
      [id]
    );

    connection.release();

    if (documents.length === 0) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json({ message: 'Document retrieved', data: documents[0] });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve document', error: error.message });
  }
});

// Verify document (admin)
router.post('/:id/verify', verifyToken, verifyRole('super_admin', 'staff'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const connection = await pool.getConnection();

    await connection.execute(
      'UPDATE documents SET verification_status = ?, verified_by = ?, verification_date = NOW() WHERE id = ?',
      [status, req.user.id, id]
    );

    connection.release();
    res.json({ message: 'Document verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to verify document', error: error.message });
  }
});

// Search/Verify document by document number (public)
router.get('/verify/:documentNumber', async (req, res) => {
  try {
    const { documentNumber } = req.params;
    const connection = await pool.getConnection();

    const [documents] = await connection.execute(
      'SELECT d.*, s.first_name, s.last_name FROM documents d JOIN students s ON d.student_id = s.id WHERE d.document_number = ?',
      [documentNumber]
    );

    connection.release();

    if (documents.length === 0) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const doc = documents[0];
    res.json({
      message: 'Document verified',
      data: {
        document_type: doc.document_type,
        student_name: `${doc.first_name} ${doc.last_name}`,
        issue_date: doc.issue_date,
        verification_status: doc.verification_status,
        is_valid: doc.verification_status === 'verified' && (!doc.expiry_date || new Date(doc.expiry_date) > new Date()),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to verify document', error: error.message });
  }
});

module.exports = router;
