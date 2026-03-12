const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middleware/auth');
const pool = require('../config/database');

// Student Dashboard
router.get('/student', verifyToken, verifyRole('student'), async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [students] = await connection.execute(
      'SELECT * FROM students WHERE user_id = ? LIMIT 1',
      [req.user.id]
    );

    if (students.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Student not found' });
    }

    const studentId = students[0].id;

    // Get enrollments
    const [enrollments] = await connection.execute(
      `SELECT e.*, c.course_name, c.course_fee FROM enrollments e 
       JOIN courses c ON e.course_id = c.id 
       WHERE e.student_id = ? ORDER BY e.enrollment_date DESC`,
      [studentId]
    );

    // Get documents
    const [documents] = await connection.execute(
      'SELECT * FROM documents WHERE student_id = ? ORDER BY created_at DESC LIMIT 5',
      [studentId]
    );

    // Get activity count
    const [activityLogs] = await connection.execute(
      'SELECT COUNT(*) as count FROM activity_logs WHERE user_id = ?',
      [req.user.id]
    );

    connection.release();

    res.json({
      message: 'Student dashboard data retrieved',
      data: {
        student: students[0],
        enrollments: enrollments,
        enrollmentCount: enrollments.length,
        documents: documents,
        documentCount: documents.length,
        stats: {
          total_enrollments: enrollments.length,
          completed: enrollments.filter(e => e.status === 'completed').length,
          in_progress: enrollments.filter(e => e.status === 'in_progress').length,
          documents_issued: documents.filter(d => d.verification_status === 'verified').length,
        },
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Failed to retrieve dashboard data', error: error.message });
  }
});

// Center Dashboard
router.get('/center', verifyToken, verifyRole('center'), async (req, res) => {
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

    // Get total students
    const [studentCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM students'
    );

    // Get total enrollments
    const [enrollmentCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM enrollments'
    );

    // Get active courses
    const [courseCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM courses WHERE status = "active"'
    );

    connection.release();

    res.json({
      message: 'Center dashboard data retrieved',
      data: {
        center: centers[0],
        stats: {
          total_students: studentCount[0].count,
          total_enrollments: enrollmentCount[0].count,
          active_courses: courseCount[0].count,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve dashboard data', error: error.message });
  }
});

// Admin Dashboard
router.get('/admin', verifyToken, verifyRole('super_admin'), async (req, res) => {
  try {
    const connection = await pool.getConnection();

    // Get total users
    const [userCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM users'
    );

    // Get total students
    const [studentCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM students'
    );

    // Get total centers
    const [centerCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM centers'
    );

    // Get total courses
    const [courseCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM courses'
    );

    // Get total enrollments
    const [enrollmentCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM enrollments'
    );

    // Get pending affiliation requests
    const [pendingAffiliations] = await connection.execute(
      'SELECT COUNT(*) as count FROM centers WHERE affiliation_status = "pending"'
    );

    // Get recent activities
    const [activities] = await connection.execute(
      'SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 10'
    );

    connection.release();

    res.json({
      message: 'Admin dashboard data retrieved',
      data: {
        stats: {
          total_users: userCount[0].count,
          total_students: studentCount[0].count,
          total_centers: centerCount[0].count,
          total_courses: courseCount[0].count,
          total_enrollments: enrollmentCount[0].count,
          pending_affiliations: pendingAffiliations[0].count,
        },
        recent_activities: activities,
      },
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Failed to retrieve dashboard data', error: error.message });
  }
});

// Staff Dashboard
router.get('/staff', verifyToken, verifyRole('staff'), async (req, res) => {
  try {
    const connection = await pool.getConnection();

    // Get total students
    const [studentCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM students'
    );

    // Get total enrollments
    const [enrollmentCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM enrollments'
    );

    // Get pending documents
    const [pendingDocs] = await connection.execute(
      'SELECT COUNT(*) as count FROM documents WHERE verification_status = "unverified"'
    );

    connection.release();

    res.json({
      message: 'Staff dashboard data retrieved',
      data: {
        stats: {
          total_students: studentCount[0].count,
          total_enrollments: enrollmentCount[0].count,
          pending_verifications: pendingDocs[0].count,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve dashboard data', error: error.message });
  }
});

module.exports = router;
