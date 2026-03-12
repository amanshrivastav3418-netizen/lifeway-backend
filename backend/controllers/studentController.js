const pool = require('../config/database');

// Get all students (for admin)
exports.getAllStudents = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [students] = await connection.execute(
      'SELECT id, user_id, first_name, last_name, mobile, email, city, status, admission_date FROM students ORDER BY admission_date DESC'
    );
    connection.release();

    res.json({
      message: 'Students retrieved successfully',
      count: students.length,
      data: students,
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Failed to retrieve students', error: error.message });
  }
};

// Get student by ID
exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    const [students] = await connection.execute(
      'SELECT * FROM students WHERE id = ? OR user_id = ?',
      [id, id]
    );

    if (students.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Student not found' });
    }

    const student = students[0];

    // Get enrollments
    const [enrollments] = await connection.execute(
      'SELECT e.*, c.course_name, c.course_code FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE e.student_id = ?',
      [student.id]
    );

    connection.release();

    res.json({
      message: 'Student retrieved successfully',
      data: {
        student,
        enrollments,
      },
    });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ message: 'Failed to retrieve student', error: error.message });
  }
};

// Get current student profile
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const connection = await pool.getConnection();

    const [students] = await connection.execute(
      'SELECT * FROM students WHERE user_id = ? LIMIT 1',
      [userId]
    );

    if (students.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const student = students[0];

    // Get enrollments
    const [enrollments] = await connection.execute(
      'SELECT e.*, c.course_name, c.course_code, c.course_fee, c.duration_months FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE e.student_id = ?',
      [student.id]
    );

    // Get documents
    const [documents] = await connection.execute(
      'SELECT * FROM documents WHERE student_id = ? ORDER BY created_at DESC',
      [student.id]
    );

    connection.release();

    res.json({
      message: 'Profile retrieved successfully',
      data: {
        student,
        enrollments,
        documents,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to retrieve profile', error: error.message });
  }
};

// Update student profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, mobile, address, city, state, postalCode } = req.body;
    const connection = await pool.getConnection();

    const [students] = await connection.execute(
      'SELECT id FROM students WHERE user_id = ? LIMIT 1',
      [userId]
    );

    if (students.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const studentId = students[0].id;

    await connection.execute(
      'UPDATE students SET first_name = ?, last_name = ?, mobile = ?, address = ?, city = ?, state = ?, postal_code = ? WHERE id = ?',
      [firstName, lastName, mobile, address, city, state, postalCode, studentId]
    );

    connection.release();

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

// Upload student photo
exports.uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.user.id;
    const photoUrl = `/uploads/${req.file.filename}`;
    const connection = await pool.getConnection();

    const [students] = await connection.execute(
      'SELECT id FROM students WHERE user_id = ? LIMIT 1',
      [userId]
    );

    if (students.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Student profile not found' });
    }

    await connection.execute(
      'UPDATE students SET photo_url = ? WHERE user_id = ?',
      [photoUrl, userId]
    );

    connection.release();

    res.json({
      message: 'Photo uploaded successfully',
      photoUrl,
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({ message: 'Failed to upload photo', error: error.message });
  }
};

// Get student enrollments
exports.getEnrollments = async (req, res) => {
  try {
    const userId = req.user.id;
    const connection = await pool.getConnection();

    const [students] = await connection.execute(
      'SELECT id FROM students WHERE user_id = ? LIMIT 1',
      [userId]
    );

    if (students.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Student not found' });
    }

    const [enrollments] = await connection.execute(
      `SELECT e.*, c.course_name, c.course_code, c.course_fee, c.duration_months, c.category
       FROM enrollments e 
       JOIN courses c ON e.course_id = c.id 
       WHERE e.student_id = ? 
       ORDER BY e.enrollment_date DESC`,
      [students[0].id]
    );

    connection.release();

    res.json({
      message: 'Enrollments retrieved successfully',
      count: enrollments.length,
      data: enrollments,
    });
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({ message: 'Failed to retrieve enrollments', error: error.message });
  }
};

// Delete student (admin only)
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    const [students] = await connection.execute(
      'SELECT user_id FROM students WHERE id = ?',
      [id]
    );

    if (students.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Student not found' });
    }

    // Delete user account (cascade will delete student)
    await connection.execute('DELETE FROM users WHERE id = ?', [students[0].user_id]);
    connection.release();

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ message: 'Failed to delete student', error: error.message });
  }
};
