const pool = require('../config/database');

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const { category, status = 'active' } = req.query;
    const connection = await pool.getConnection();

    let query = 'SELECT * FROM courses WHERE status = ?';
    let params = [status];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY course_name';

    const [courses] = await connection.execute(query, params);
    connection.release();

    res.json({
      message: 'Courses retrieved successfully',
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Failed to retrieve courses', error: error.message });
  }
};

// Get course by ID
exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    const [courses] = await connection.execute(
      'SELECT * FROM courses WHERE id = ?',
      [id]
    );

    if (courses.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Course not found' });
    }

    // Get enrollment count
    const [enrollmentCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM enrollments WHERE course_id = ?',
      [id]
    );

    connection.release();

    res.json({
      message: 'Course retrieved successfully',
      data: {
        ...courses[0],
        enrolled_students: enrollmentCount[0].count,
      },
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ message: 'Failed to retrieve course', error: error.message });
  }
};

// Create course (admin only)
exports.createCourse = async (req, res) => {
  try {
    const { courseName, courseCode, category, description, durationMonths, courseFee, maxStudents } = req.body;
    const connection = await pool.getConnection();

    const [result] = await connection.execute(
      'INSERT INTO courses (course_name, course_code, category, description, duration_months, course_fee, max_students, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [courseName, courseCode, category, description, durationMonths, courseFee, maxStudents, req.user.id]
    );

    connection.release();

    res.status(201).json({
      message: 'Course created successfully',
      courseId: result.insertId,
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Failed to create course', error: error.message });
  }
};

// Update course (admin only)
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { courseName, category, description, durationMonths, courseFee, maxStudents, status } = req.body;
    const connection = await pool.getConnection();

    await connection.execute(
      'UPDATE courses SET course_name = ?, category = ?, description = ?, duration_months = ?, course_fee = ?, max_students = ?, status = ? WHERE id = ?',
      [courseName, category, description, durationMonths, courseFee, maxStudents, status, id]
    );

    connection.release();

    res.json({ message: 'Course updated successfully' });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Failed to update course', error: error.message });
  }
};

// Delete course (admin only)
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    // Check if course has enrollments
    const [enrollments] = await connection.execute(
      'SELECT COUNT(*) as count FROM enrollments WHERE course_id = ?',
      [id]
    );

    if (enrollments[0].count > 0) {
      connection.release();
      return res.status(400).json({ message: 'Cannot delete course with active enrollments' });
    }

    await connection.execute('DELETE FROM courses WHERE id = ?', [id]);
    connection.release();

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Failed to delete course', error: error.message });
  }
};

// Get course categories
exports.getCourseCategories = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [categories] = await connection.execute(
      'SELECT DISTINCT category FROM courses WHERE status = "active" AND category IS NOT NULL ORDER BY category'
    );

    connection.release();

    res.json({
      message: 'Categories retrieved successfully',
      data: categories.map(c => c.category),
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Failed to retrieve categories', error: error.message });
  }
};

// Enroll student in course
exports.enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;
    const connection = await pool.getConnection();

    // Get student ID
    const [students] = await connection.execute(
      'SELECT id FROM students WHERE user_id = ? LIMIT 1',
      [userId]
    );

    if (students.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const studentId = students[0].id;

    // Check if already enrolled
    const [existing] = await connection.execute(
      'SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?',
      [studentId, courseId]
    );

    if (existing.length > 0) {
      connection.release();
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Check course availability
    const [course] = await connection.execute(
      'SELECT max_students FROM courses WHERE id = ?',
      [courseId]
    );

    if (course.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Course not found' });
    }

    const [enrollmentCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM enrollments WHERE course_id = ? AND status IN ("enrolled", "in_progress")',
      [courseId]
    );

    if (course[0].max_students && enrollmentCount[0].count >= course[0].max_students) {
      connection.release();
      return res.status(400).json({ message: 'Course is full' });
    }

    // Create enrollment
    const [result] = await connection.execute(
      'INSERT INTO enrollments (student_id, course_id, enrollment_date, status) VALUES (?, ?, NOW(), ?)',
      [studentId, courseId, 'enrolled']
    );

    connection.release();

    res.status(201).json({
      message: 'Enrolled successfully',
      enrollmentId: result.insertId,
    });
  } catch (error) {
    console.error('Enroll course error:', error);
    res.status(500).json({ message: 'Failed to enroll', error: error.message });
  }
};
