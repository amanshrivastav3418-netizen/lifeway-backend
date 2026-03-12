/**
 * Main Script - UI Interactions and Navigation
 * Handles page navigation, forms, modals, and user interactions
 */

// Global variables
let currentUser = null;
let currentPage = 'home';

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function () {
  console.log('🚀 Initializing Lifeway Application');

  // Check if user is logged in
  currentUser = apiService.getUser();
  
  // Update UI based on authentication status
  updateAuthUI();

  // Set initial page from URL
  const urlParams = new URLSearchParams(window.location.search);
  const page = urlParams.get('page') || 'home';
  navigate(page);

  // Setup event listeners
  setupEventListeners();

  // Load initial data
  await loadInitialData();
});

// ===== PAGE NAVIGATION =====

function navigate(pageName) {
  currentPage = pageName;

  // Hide all pages
  document.querySelectorAll('.page-section').forEach(page => {
    page.classList.remove('active-page');
  });

  // Show selected page
  const selectedPage = document.getElementById(`page-${pageName}`);
  if (selectedPage) {
    selectedPage.classList.add('active-page');
  }

  // Update URL
  window.history.pushState(null, '', `?page=${pageName}`);

  // Load page-specific data
  loadPageData(pageName);

  // Scroll to top
  window.scrollTo(0, 0);
}

// Load page-specific data
async function loadPageData(page) {
  try {
    switch (page) {
      case 'home':
        initializeSlider();
        break;
      case 'courses':
        await loadCourses();
        break;
      case 'login':
        setupLoginForm();
        break;
      case 'std-dashboard':
        await loadStudentDashboard();
        break;
      case 'center-login':
        setupCenterLoginForm();
        break;
      case 'cen-dashboard':
        await loadCenterDashboard();
        break;
      case 'super-login':
        setupSuperAdminLoginForm();
        break;
      case 'super-dashboard':
        await loadAdminDashboard();
        break;
      case 'team-login':
        setupStaffLoginForm();
        break;
      case 'team-dashboard':
        await loadStaffDashboard();
        break;
      case 'contact':
        setupContactForm();
        break;
      case 'about':
        setupAboutTabs();
        break;
      case 'student-work':
        await loadStudentWork();
        break;
      case 'student-documents':
        await loadStudentDocuments();
        break;
      case 'verify-document':
        setupDocumentVerificationForm();
        break;
      case 'downloads':
        setupDownloadsPage();
        break;
    }
  } catch (error) {
    console.error(`Error loading page ${page}:`, error);
  }
}

// ===== AUTHENTICATION UI =====

function updateAuthUI() {
  const user = apiService.getUser();

  if (user) {
    // User is logged in
    console.log('✓ User logged in as:', user.email, `(${user.role})`);

    // Show/hide navigation items based on role
    updateNavigationBasedOnRole(user.role);

    // Show logout option
    const loginNav = document.querySelector('[onclick="navigate(\'login\')"]');
    if (loginNav) {
      loginNav.style.display = 'none';
    }
  } else {
    // User is not logged in
    console.log('User not logged in');
    updateNavigationBasedOnRole(null);
  }
}

function updateNavigationBasedOnRole(role) {
  // Show student documents nav item only for logged-in students
  const studentDocsNav = document.getElementById('nav-student-docs');
  if (studentDocsNav) {
    studentDocsNav.style.display = role === 'student' ? 'inline' : 'none';
  }
}

// ===== LOGIN & REGISTRATION =====

function setupLoginForm() {
  const form = document.getElementById('student-login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = form.querySelector('[name="email"]').value;
    const password = form.querySelector('[name="password"]').value;

    try {
      showLoadingMessage('Logging in...');

      const response = await apiService.login(email, password);

      if (response.success) {
        updateAuthUI();
        showSuccessMessage('✓ Login successful! Redirecting...');

        // Redirect based on role
        setTimeout(() => {
          navigate('std-dashboard');
        }, 1500);
      } else {
        showErrorMessage(response.error || 'Login failed');
      }
    } catch (error) {
      showErrorMessage('Login error: ' + error.message);
    }
  });
}

function setupCenterLoginForm() {
  const form = document.getElementById('center-login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = form.querySelector('[name="email"]').value;
    const password = form.querySelector('[name="password"]').value;

    try {
      showLoadingMessage('Logging in...');

      const response = await apiService.login(email, password);

      if (response.success && response.data.user.role === 'center') {
        updateAuthUI();
        showSuccessMessage('✓ Login successful!');

        setTimeout(() => {
          navigate('cen-dashboard');
        }, 1500);
      } else {
        showErrorMessage('Invalid center login credentials');
      }
    } catch (error) {
      showErrorMessage('Login error: ' + error.message);
    }
  });
}

function setupSuperAdminLoginForm() {
  const form = document.getElementById('super-login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = form.querySelector('[name="email"]').value;
    const password = form.querySelector('[name="password"]').value;

    try {
      showLoadingMessage('Logging in...');

      const response = await apiService.login(email, password);

      if (response.success && response.data.user.role === 'super_admin') {
        updateAuthUI();
        showSuccessMessage('✓ Admin login successful!');

        setTimeout(() => {
          navigate('super-dashboard');
        }, 1500);
      } else {
        showErrorMessage('Invalid admin credentials');
      }
    } catch (error) {
      showErrorMessage('Login error: ' + error.message);
    }
  });
}

function setupStaffLoginForm() {
  const form = document.getElementById('team-login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = form.querySelector('[name="email"]').value;
    const password = form.querySelector('[name="password"]').value;

    try {
      showLoadingMessage('Logging in...');

      const response = await apiService.login(email, password);

      if (response.success && response.data.user.role === 'staff') {
        updateAuthUI();
        showSuccessMessage('✓ Staff login successful!');

        setTimeout(() => {
          navigate('team-dashboard');
        }, 1500);
      } else {
        showErrorMessage('Invalid staff credentials');
      }
    } catch (error) {
      showErrorMessage('Login error: ' + error.message);
    }
  });
}

// ===== STUDENT DASHBOARD =====

async function loadStudentDashboard() {
  try {
    if (!apiService.isAuthenticated()) {
      navigate('login');
      return;
    }

    showLoadingMessage('Loading dashboard...');

    const response = await apiService.getStudentDashboard();

    if (response.success) {
      const data = response.data.data;
      displayStudentDashboard(data);
      hideLoadingMessage();
    } else {
      showErrorMessage('Failed to load dashboard: ' + response.error);
    }
  } catch (error) {
    showErrorMessage('Dashboard error: ' + error.message);
  }
}

function displayStudentDashboard(data) {
  const dashboard = document.getElementById('page-std-dashboard');
  if (!dashboard) return;

  const student = data.student;
  const stats = data.stats;
  const enrollments = data.enrollments || [];

  // Update student info
  const profileSection = dashboard.querySelector('.std-sidebar');
  if (profileSection) {
    profileSection.innerHTML = `
      <div class="std-profile-box">
        <img src="${student.photo_url || 'https://via.placeholder.com/140'}" alt="Profile" class="std-img">
        <div class="std-cam-btn" onclick="triggerPhotoUpload()"><i class="fas fa-camera"></i></div>
      </div>
      <h3>${student.first_name} ${student.last_name || ''}</h3>
      <p style="color: #777; margin: 5px 0; font-size: 12px;">ID: ${student.id}</p>
      <p style="color: #777; margin: 5px 0; font-size: 12px;">${student.mobile || 'N/A'}</p>
      <p style="color: #777; margin: 5px 0; font-size: 12px;">${student.city || 'N/A'}</p>
      
      <button class="std-menu-btn active" onclick="switchStdTab('overview')">
        <i class="fas fa-home"></i> Dashboard
      </button>
      <button class="std-menu-btn" onclick="switchStdTab('profile')">
        <i class="fas fa-user"></i> Profile
      </button>
      <button class="std-menu-btn" onclick="switchStdTab('courses')">
        <i class="fas fa-book"></i> My Courses
      </button>
      <button class="std-menu-btn" onclick="switchStdTab('documents')">
        <i class="fas fa-file"></i> Documents
      </button>
      <button class="std-menu-btn" onclick="logout()">
        <i class="fas fa-sign-out-alt"></i> Logout
      </button>
    `;
  }

  // Update content area
  const contentSection = dashboard.querySelector('.std-content');
  if (contentSection) {
    contentSection.innerHTML = `
      <div id="std-overview-tab" class="std-tab active-tab">
        <h2>Welcome, ${student.first_name}!</h2>
        <div class="std-stats-bar">
          <div class="std-stat-item">
            <div class="std-stat-val">${stats.total_enrollments}</div>
            <small>Enrollments</small>
          </div>
          <div class="std-stat-item">
            <div class="std-stat-val">${stats.completed}</div>
            <small>Completed</small>
          </div>
          <div class="std-stat-item">
            <div class="std-stat-val">${stats.in_progress}</div>
            <small>In Progress</small>
          </div>
          <div class="std-stat-item">
            <div class="std-stat-val">${stats.documents_issued}</div>
            <small>Documents</small>
          </div>
        </div>

        <h3 style="margin-top: 30px;">Recent Enrollments</h3>
        <div id="recent-enrollments-list">
          ${enrollments.slice(0, 5).map(e => `
            <div class="card" style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h4 style="margin: 0;color: #333;">${e.course_name}</h4>
                <small style="color: #777;">Status: <strong>${e.status}</strong></small>
                <small style="display: block; color: #777; margin-top: 5px;">
                  Enrolled: ${new Date(e.enrollment_date).toLocaleDateString()}
                </small>
              </div>
              <div>
                ${e.status === 'completed' ? `<span class="badge bg-green">Completed</span>` : ''}
                ${e.status === 'in_progress' ? `<span class="badge bg-orange">In Progress</span>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div id="std-profile-tab" class="std-tab" style="display: none;">
        <h2>My Profile</h2>
        <form id="update-profile-form" class="form-grid">
          <div>
            <label>First Name</label>
            <input type="text" name="firstName" value="${student.first_name}" required>
          </div>
          <div>
            <label>Last Name</label>
            <input type="text" name="lastName" value="${student.last_name || ''}">
          </div>
          <div>
            <label>Mobile</label>
            <input type="tel" name="mobile" value="${student.mobile || ''}">
          </div>
          <div>
            <label>City</label>
            <input type="text" name="city" value="${student.city || ''}">
          </div>
          <div>
            <label>State</label>
            <input type="text" name="state" value="${student.state || ''}">
          </div>
          <div>
            <label>Address</label>
            <textarea name="address" style="grid-column: 1/-1;">${student.address || ''}</textarea>
          </div>
          <button type="submit" class="btn btn-blue" style="grid-column: 1/-1;">Update Profile</button>
        </form>
      </div>

      <div id="std-courses-tab" class="std-tab" style="display: none;">
        <h2>My Courses</h2>
        <div id="student-courses-list">
          ${enrollments.length > 0 ? enrollments.map(e => `
            <div class="card">
              <div style="display: flex; justify-content: space-between; align-items: start;">
                <div style="flex: 1;">
                  <h4 style="margin: 0; color: #333;">${e.course_name}</h4>
                  <p style="color: #777; font-size: 12px; margin: 5px 0;">Code: ${e.course_code}</p>
                  <p style="color: #777; font-size: 12px; margin: 5px 0;">Duration: ${e.duration_months} months</p>
                  ${e.marks_obtained ? `<p style="color: #333; margin: 10px 0;"><strong>Marks: ${e.marks_obtained}/100</strong></p>` : ''}
                </div>
                <div style="text-align: right;">
                  <span class="badge bg-${e.status === 'completed' ? 'green' : e.status === 'in_progress' ? 'orange' : 'gray'}">${e.status}</span>
                  ${e.certificate_issued ? `<br><button class="btn btn-blue" style="margin-top: 10px; font-size: 11px;" onclick="downloadCertificate(${e.id})">Download Certificate</button>` : ''}
                </div>
              </div>
            </div>
          `).join('') : '<p>No enrollments yet. <a onclick="navigate(\'courses\')">Browse courses</a></p>'}
        </div>
      </div>

      <div id="std-documents-tab" class="std-tab" style="display: none;">
        <h2>Documents</h2>
        <div id="student-documents-list">
          ${data.documents.length > 0 ? data.documents.map(doc => `
            <div class="card">
              <h4 style="margin: 0; color: #333;">${doc.document_type.replace(/_/g, ' ').toUpperCase()}</h4>
              <p style="color: #777; margin: 5px 0 10px;">Document #: ${doc.document_number}</p>
              <p style="margin: 0;">Status: <span class="badge bg-${doc.verification_status === 'verified' ? 'green' : 'orange'}">${doc.verification_status}</span></p>
              ${doc.document_url ? `<a href="${doc.document_url}" class="btn btn-blue" style="margin-top: 10px; display: inline-block; font-size: 12px;">Download</a>` : ''}
            </div>
          `).join('') : '<p>No documents issued yet.</p>'}
        </div>
      </div>
    `;

    // Setup form listener
    const profileForm = document.getElementById('update-profile-form');
    if (profileForm) {
      profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(profileForm);
        const data = Object.fromEntries(formData);

        const response = await apiService.updateProfile(data);
        if (response.success) {
          showSuccessMessage('Profile updated successfully');
          setTimeout(() => loadStudentDashboard(), 1500);
        } else {
          showErrorMessage('Failed to update profile: ' + response.error);
        }
      });
    }
  }
}

function switchStdTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.std-tab').forEach(tab => {
    tab.style.display = 'none';
  });

  // Show selected tab
  const tab = document.getElementById(`std-${tabName}-tab`);
  if (tab) tab.style.display = 'block';

  // Update button active state
  document.querySelectorAll('.std-menu-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
}

// ===== COURSES PAGE =====

async function loadCourses() {
  try {
    showLoadingMessage('Loading courses...');

    const response = await apiService.getAllCourses();

    if (response.success) {
      displayCourses(response.data.data);
      hideLoadingMessage();
    } else {
      showErrorMessage('Failed to load courses');
    }
  } catch (error) {
    showErrorMessage('Error loading courses: ' + error.message);
  }
}

function displayCourses(courses) {
  const coursePage = document.getElementById('page-courses');
  if (!coursePage) return;

  const courseGrid = coursePage.querySelector('.course-card-grid') || coursePage;

  let html = '<div class="course-card-grid">';

  courses.forEach(course => {
    html += `
      <div class="pub-course-card">
        <div class="pub-course-img-box">
          <img src="https://via.placeholder.com/300x200?text=${encodeURIComponent(course.course_name)}" alt="${course.course_name}" class="pub-course-img">
        </div>
        <div class="pub-course-body">
          <h3 class="pub-course-title">${course.course_name}</h3>
          <span class="course-badge">${course.category || 'General'}</span>
          <p class="pub-course-desc">${course.description || 'Quality education program'}</p>
          <div class="pub-course-footer">
            <span class="price-tag">₹${course.course_fee || 'Enquire'}</span>
            <span class="duration-tag">${course.duration_months || '0'} Months</span>
          </div>
          <button class="btn-course-action" onclick="enrollInCourse(${course.id}, '${course.course_name}')">
            Enroll Now
          </button>
        </div>
      </div>
    `;
  });

  html += '</div>';

  coursePage.innerHTML = html;
}

function goToCourseCategory(category) {
  navigate('courses');
  // TODO: Load courses filtered by category
}

async function enrollInCourse(courseId, courseName) {
  if (!apiService.isAuthenticated()) {
    showErrorMessage('Please login to enroll');
    navigate('login');
    return;
  }

  try {
    showLoadingMessage('Enrolling in course...');

    const response = await apiService.enrollCourse(courseId);

    if (response.success) {
      showSuccessMessage(`✓ Successfully enrolled in ${courseName}!`);
      setTimeout(() => {
        navigate('std-dashboard');
      }, 1500);
    } else {
      showErrorMessage(response.error || 'Enrollment failed');
    }
  } catch (error) {
    showErrorMessage('Enrollment error: ' + error.message);
  }
}

// ===== ADMIN DASHBOARD =====

async function loadAdminDashboard() {
  try {
    if (!apiService.isAuthenticated() || apiService.getUserRole() !== 'super_admin') {
      navigate('super-login');
      return;
    }

    showLoadingMessage('Loading admin dashboard...');

    const response = await apiService.getAdminDashboard();

    if (response.success) {
      displayAdminDashboard(response.data.data);
      hideLoadingMessage();
    }
  } catch (error) {
    showErrorMessage('Error loading dashboard: ' + error.message);
  }
}

function displayAdminDashboard(data) {
  const dashboard = document.getElementById('page-super-dashboard');
  if (!dashboard) return;

  const { stats } = data;

  const mainContent = dashboard.querySelector('.sa-main') || dashboard;

  mainContent.innerHTML = `
    <div class="sa-stat-grid">
      <div class="sa-stat-box">
        <h2>${stats.total_students}</h2>
        <p>Total Students</p>
      </div>
      <div class="sa-stat-box">
        <h2>${stats.total_courses}</h2>
        <p>Total Courses</p>
      </div>
      <div class="sa-stat-box">
        <h2>${stats.total_enrollments}</h2>
        <p>Total Enrollments</p>
      </div>
      <div class="sa-stat-box">
        <h2>${stats.total_centers}</h2>
        <p>Affiliated Centers</p>
      </div>
    </div>

    <div class="sa-card">
      <h3>Quick Actions</h3>
      <button class="btn btn-blue" onclick="navigate('downloads')">Manage Courses</button>
      <button class="btn btn-green" style="margin-left: 10px;" onclick="openAddStudentModal()">Add Student</button>
      <button class="btn btn-orange" style="margin-left: 10px;" onclick="openReportsModal()">View Reports</button>
    </div>

    <div class="sa-card">
      <h3>Pending Affiliations</h3>
      <p>Centers awaiting approval: ${stats.pending_affiliations}</p>
      ${stats.pending_affiliations > 0 ? '<button class="btn btn-blue" onclick="loadPendingAffiliations()">Review Requests</button>' : '<p>All affiliations approved!</p>'}
    </div>
  `;
}

// ===== CONTACT FORM =====

function setupContactForm() {
  const form = document.getElementById('contact-form') || document.querySelector('form[name="contact"]');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    // TODO: Send to backend
    console.log('Contact form submitted:', data);
    showSuccessMessage('✓ Thank you! We will contact you soon.');
    form.reset();
  });
}

// ===== MODALS =====

function openBankModal() {
  const modal = document.getElementById('cen-modal') || createModal('Bank Details');
  if (modal) {
    modal.innerHTML = `
      <div class="cen-modal-content">
        <span class="close" onclick="closeModal()">&times;</span>
        <h3>Bank Details</h3>
        <div id="bank-details-list">
          <p>Loading bank details...</p>
        </div>
      </div>
    `;
    modal.style.display = 'flex';
  }
}

function openSuggestionModal() {
  const modal = document.getElementById('cen-modal') || createModal('Suggestions');
  if (modal) {
    modal.innerHTML = `
      <div class="cen-modal-content">
        <span class="close" onclick="closeModal()">&times;</span>
        <h3>Send Suggestions</h3>
        <form id="suggestion-form">
          <textarea name="message" placeholder="Your suggestion..." required style="width: 100%; height: 150px; padding: 10px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px;"></textarea>
          <button type="submit" class="btn btn-blue">Send</button>
        </form>
      </div>
    `;
    modal.style.display = 'flex';

    document.getElementById('suggestion-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      showSuccessMessage('Thank you for your suggestion!');
      closeModal();
    });
  }
}

function openFranchiseQuery() {
  const modal = document.getElementById('cen-modal') || createModal('Franchise Query');
  if (modal) {
    modal.innerHTML = `
      <div class="cen-modal-content">
        <span class="close" onclick="closeModal()">&times;</span>
        <h3>Franchise Inquiry Form</h3>
        <form id="franchise-form" class="form-grid">
          <input type="text" name="name" placeholder="Your Name" required>
          <input type="email" name="email" placeholder="Email" required>
          <input type="tel" name="phone" placeholder="Phone" required>
          <input type="text" name="city" placeholder="City" required>
          <textarea name="message" placeholder="Tell us about your interest..." required style="grid-column: 1/-1; height: 120px;"></textarea>
          <button type="submit" class="btn btn-blue" style="grid-column: 1/-1;">Submit</button>
        </form>
      </div>
    `;
    modal.style.display = 'flex';

    document.getElementById('franchise-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      showSuccessMessage('Thank you! Our team will contact you soon!');
      closeModal();
    });
  }
}

function openVerifyCenterModal() {
  const modal = document.getElementById('cen-modal') || createModal('Verify Center');
  if (modal) {
    modal.innerHTML = `
      <div class="cen-modal-content">
        <span class="close" onclick="closeModal()">&times;</span>
        <h3>Verify Study Center</h3>
        <form id="verify-center-form">
          <input type="text" name="centerCode" placeholder="Enter Center Code" required style="width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px;">
          <button type="submit" class="btn btn-blue" style="width: 100%;">Verify</button>
        </form>
        <div id="verify-result" style="margin-top: 20px;"></div>
      </div>
    `;
    modal.style.display = 'flex';

    document.getElementById('verify-center-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const centerCode = e.target.centerCode.value;
      // TODO: Verify center from backend
      document.getElementById('verify-result').innerHTML = '<p>✓ Center verified successfully!</p>';
    });
  }
}

function closeModal() {
  const modals = document.querySelectorAll('[id*="modal"]');
  modals.forEach(modal => {
    modal.style.display = 'none';
  });
}

function createModal(title) {
  const modal = document.createElement('div');
  modal.className = 'cen-modal';
  modal.id = 'cen-modal';
  document.body.appendChild(modal);
  return modal;
}

// ===== ABOUT PAGE =====

function setupAboutTabs() {
  const menuItems = document.querySelectorAll('.abt-menu-item');
  menuItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      const tabName = ['intro', 'mission', 'dream', 'advantages', 'director', 'team'][index] || 'intro';
      switchAboutTab(tabName, item);
    });
  });
}

function switchAboutTab(tabName, element) {
  // Hide all tabs
  document.querySelectorAll('.abt-tab').forEach(tab => {
    tab.classList.remove('active-tab');
  });

  // Show selected tab
  const tab = document.getElementById(`abt-tab-${tabName}`);
  if (tab) tab.classList.add('active-tab');

  // Update active menu item
  document.querySelectorAll('.abt-menu-item').forEach(item => {
    item.classList.remove('active');
  });
  if (element) element.classList.add('active');
}

// ===== DOCUMENT VERIFICATION =====

function setupDocumentVerificationForm() {
  const form = document.getElementById('doc-verify-form') || document.querySelector('form[name="verify-document"]');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const documentNumber = form.querySelector('[name="documentNumber"]').value;

    try {
      showLoadingMessage('Verifying document...');

      const response = await apiService.verifyDocument(documentNumber);

      if (response.success) {
        const doc = response.data.data;
        showSuccessMessage(`Document verified! Issued to ${doc.student_name}`);

        const resultDiv = form.nextElementSibling || form.parentElement;
        if (resultDiv) {
          resultDiv.innerHTML = `
            <div class="card" style="border-left: 5px solid green;">
              <h4>✓ Document Valid</h4>
              <p><strong>Student Name:</strong> ${doc.student_name}</p>
              <p><strong>Document Type:</strong> ${doc.document_type}</p>
              <p><strong>Issue Date:</strong> ${new Date(doc.issue_date).toLocaleDateString()}</p>
              <p><strong>Status:</strong> <span style="color: green; font-weight: bold;">${doc.verification_status}</span></p>
            </div>
          `;
        }
      } else {
        showErrorMessage(response.error || 'Document not found');
      }
    } catch (error) {
      showErrorMessage('Verification error: ' + error.message);
    }
  });
}

// ===== UTILITY FUNCTIONS =====

function logout() {
  apiService.logout();
  updateAuthUI();
  navigate('home');
  showSuccessMessage('Logged out successfully');
}

function showSuccessMessage(message) {
  console.log('✓', message);
  // Create alert
  const alert = document.createElement('div');
  alert.className = 'alert-success';
  alert.textContent = message;
  alert.style.cssText = `
    position: fixed; top: 20px; right: 20px; background: #4CAF50; color: white;
    padding: 15px 20px; border-radius: 4px; z-index: 9999; box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  `;
  document.body.appendChild(alert);

  setTimeout(() => alert.remove(), 3000);
}

function showErrorMessage(message) {
  console.error('✗', message);
  const alert = document.createElement('div');
  alert.className = 'alert-error';
  alert.textContent = message;
  alert.style.cssText = `
    position: fixed; top: 20px; right: 20px; background: #f44336; color: white;
    padding: 15px 20px; border-radius: 4px; z-index: 9999; box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  `;
  document.body.appendChild(alert);

  setTimeout(() => alert.remove(), 3000);
}

function showLoadingMessage(message) {
  const msg = document.getElementById('loading-message') || (() => {
    const div = document.createElement('div');
    div.id = 'loading-message';
    document.body.appendChild(div);
    return div;
  })();

  msg.innerHTML = `<div style="text-align: center; padding: 20px;">${message}</div>`;
  msg.style.cssText = `
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    z-index: 9998;
  `;
}

function hideLoadingMessage() {
  const msg = document.getElementById('loading-message');
  if (msg) msg.style.display = 'none';
}

// ===== SLIDER FUNCTIONALITY =====

function initializeSlider() {
  const slides = document.querySelectorAll('.sg-slide');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  let currentSlide = 0;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentSlide = (currentSlide - 1 + slides.length) % slides.length;
      showSlide(currentSlide);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    });
  }

  // Auto-rotate slides
  setInterval(() => {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }, 5000);
}

// ===== SETUP EVENT LISTENERS =====

function setupEventListeners() {
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href*="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // Scroll to top button
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      scrollTopBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
    });

    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

// ===== LOAD INITIAL DATA =====

async function loadInitialData() {
  // Load courses data for filtering
  const response = await apiService.getAllCourses();
  if (response.success) {
    window.allCourses = response.data.data;
  }
}

// Stub functions for pages not yet fully implemented

async function loadStudentWork() {}
async function loadStudentDocuments() {}
async function loadCenterDashboard() {}
async function loadStaffDashboard() {}
function setupDownloadsPage() {}
function contact() {
  navigate('contact');
}

console.log('📚 Lifeway script loaded successfully');
