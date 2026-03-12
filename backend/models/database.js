const pool = require('../config/database');

const initializeDatabase = async () => {
  // Skip database initialization in development mode or if server is local
  if (process.env.NODE_ENV !== 'production') {
    console.log('ℹ️  Database initialization skipped (development mode)');
    console.log('ℹ️  Database tables will be created on first connection in production');
    return Promise.resolve();
  }

  try {
    const connection = await pool.getConnection();

    // Users table (for login)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('student', 'center', 'staff', 'super_admin') DEFAULT 'student',
        status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Students table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100),
        date_of_birth DATE,
        gender ENUM('male', 'female', 'other'),
        mobile VARCHAR(20) UNIQUE,
        phone VARCHAR(20),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        postal_code VARCHAR(20),
        country VARCHAR(100) DEFAULT 'India',
        photo_url VARCHAR(255),
        id_card_number VARCHAR(50) UNIQUE,
        id_card_photo_url VARCHAR(255),
        admission_date DATE,
        status ENUM('active', 'completed', 'suspended', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_mobile (mobile),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Centers (Franchises/ASCs)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS centers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        center_name VARCHAR(255) NOT NULL UNIQUE,
        center_code VARCHAR(50) UNIQUE,
        owner_name VARCHAR(100),
        contact_person VARCHAR(100),
        email VARCHAR(255),
        phone VARCHAR(20),
        mobile VARCHAR(20),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        postal_code VARCHAR(20),
        country VARCHAR(100) DEFAULT 'India',
        registration_document_url VARCHAR(255),
        affiliation_date DATE,
        affiliation_status ENUM('pending', 'approved', 'rejected', 'active', 'inactive') DEFAULT 'pending',
        status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_center_code (center_code),
        INDEX idx_affiliation_status (affiliation_status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Staff/Team Members
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS staff (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100),
        position VARCHAR(100),
        department VARCHAR(100),
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(20),
        hire_date DATE,
        photo_url VARCHAR(255),
        status ENUM('active', 'inactive', 'on_leave') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Super Admins
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS super_admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100),
        permissions TEXT,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Courses
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_name VARCHAR(255) NOT NULL,
        course_code VARCHAR(50) UNIQUE,
        category VARCHAR(100),
        description TEXT,
        duration_months INT,
        course_fee DECIMAL(10, 2),
        max_students INT,
        status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Enrollments
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        course_id INT NOT NULL,
        enrollment_date DATE,
        completion_date DATE NULL,
        status ENUM('enrolled', 'in_progress', 'completed', 'dropped', 'suspended') DEFAULT 'enrolled',
        marks_obtained DECIMAL(5, 2) NULL,
        certificate_issued BOOLEAN DEFAULT FALSE,
        certificate_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id),
        INDEX idx_student_id (student_id),
        INDEX idx_course_id (course_id),
        UNIQUE KEY unique_enrollment (student_id, course_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Student Documents
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        document_type ENUM('admit_card', 'id_card', 'certificate', 'mark_sheet', 'transcript', 'other') NOT NULL,
        document_url VARCHAR(255),
        issue_date DATE,
        expiry_date DATE NULL,
        verification_status ENUM('verified', 'unverified', 'rejected') DEFAULT 'unverified',
        verified_by INT,
        verification_date TIMESTAMP NULL,
        document_number VARCHAR(100) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (verified_by) REFERENCES users(id),
        INDEX idx_student_id (student_id),
        INDEX idx_verification_status (verification_status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Activity Logs
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        action VARCHAR(100),
        entity_type VARCHAR(100),
        entity_id INT,
        details JSON,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Bank Details
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS bank_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        bank_name VARCHAR(255) NOT NULL,
        account_holder_name VARCHAR(255) NOT NULL,
        account_number VARCHAR(50) UNIQUE NOT NULL,
        ifsc_code VARCHAR(20),
        branch_name VARCHAR(255),
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Feedback/Suggestions
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS feedback (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        user_email VARCHAR(255),
        feedback_type VARCHAR(100),
        message TEXT,
        rating INT,
        status ENUM('new', 'read', 'resolved') DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Initialize with default super admin if not exists
    const [adminCheck] = await connection.execute(
      'SELECT id FROM super_admins LIMIT 1'
    );

    if (adminCheck.length === 0) {
      const bcrypt = require('bcryptjs');
      const defaultPassword = await bcrypt.hash('admin@123', 10);
      
      // Create default user
      const [userRes] = await connection.execute(
        'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
        ['admin@lifeway.com', defaultPassword, 'super_admin']
      );

      // Create super admin
      await connection.execute(
        'INSERT INTO super_admins (user_id, first_name, last_name) VALUES (?, ?, ?)',
        [userRes.insertId, 'Lifeway', 'Administrator']
      );

      console.log('✓ Default super admin created: admin@lifeway.com (password: admin@123)');
      console.log('⚠ IMPORTANT: Change admin password immediately in production!');
    }

    connection.release();
    console.log('✓ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('✗ Database initialization error:', error.message);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    return false;
  }
};

module.exports = { initializeDatabase };
