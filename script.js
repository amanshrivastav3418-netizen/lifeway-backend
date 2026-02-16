/**
 * =========================================
 * LIFEWAY COMPUTERS - LMS FRONTEND LOGIC
 * Architecture: SPA + Cloud Backend API
 * =========================================
 */

/* =========================================
   1. API CONFIGURATION
   ========================================= */
// 🔴 IMPORTANT: Render deploy karne ke baad yahan apna Render URL dalna
// Example: "https://lifeway-lms-server.onrender.com/api"
// Jab tak local test kar rahe ho, localhost rakho:
const API_URL = "https://lifeway-backend.onrender.com";

// Global State
let currentUser = null;
let userRole = null;

// ==========================================
// 1. PAGE NAVIGATION LOGIC
// ==========================================
function navigate(pageId) {
    document.querySelectorAll('.page-section').forEach(el => el.style.display = 'none');
    const target = document.getElementById('page-' + pageId);
    if(target) {
        target.style.display = 'block';
        window.scrollTo(0, 0);
    }
}

// On Load
document.addEventListener("DOMContentLoaded", () => {
    navigate('home');
    loadPublicData(); // Load Courses/Notices instantly
});

// ==========================================
// 2. AUTHENTICATION (REAL LOGIN)
// ==========================================

// Super Admin Login
async function saLogin() {
    const u = document.getElementById('sa-login-user').value;
    const p = document.getElementById('sa-login-pass').value;
    
    try {
        const res = await fetch(`${API_URL}/api/auth/admin`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ username: u, password: p })
        });
        const data = await res.json();
        
        if(res.ok) {
            alert("✅ " + data.message);
            navigate('super-dashboard');
            loadAdminStats(); // Load Real Counts
        } else {
            alert("❌ " + data.error);
        }
    } catch(e) { alert("Server Error"); }
}

// Center Login
async function centerLogin() {
    const u = document.getElementById('cen-user').value;
    const p = document.getElementById('cen-pass').value;

    try {
        const res = await fetch(`${API_URL}/api/auth/center`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ center_code: u, password: p })
        });
        const data = await res.json();

        if(res.ok) {
            alert("✅ Welcome " + data.center.center_name);
            sessionStorage.setItem('center', JSON.stringify(data.center));
            navigate('cen-dashboard');
        } else {
            alert("❌ " + data.error);
        }
    } catch(e) { alert("Server Error"); }
}

// Student Login
async function studentLogin() {
    const u = document.getElementById('std-user').value;
    const p = document.getElementById('std-pass').value;

    try {
        const res = await fetch(`${API_URL}/api/auth/student`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ enrollment_no: u, password: p })
        });
        const data = await res.json();

        if(res.ok) {
            sessionStorage.setItem('student', JSON.stringify(data.student));
            navigate('std-dashboard');
            loadStudentDashboard();
        } else {
            alert("❌ " + data.error);
        }
    } catch(e) { alert("Server Error"); }
}

// ==========================================
// 3. ADMIN DASHBOARD FUNCTIONS (REAL DATA ENTRY)
// ==========================================

// Load Stats
async function loadAdminStats() {
    try {
        const res = await fetch(`${API_URL}/api/admin/stats`);
        const data = await res.json();
        if(document.getElementById('sa-stat-students')) document.getElementById('sa-stat-students').innerText = data.students;
        if(document.getElementById('sa-stat-active')) document.getElementById('sa-stat-active').innerText = data.centers;
        if(document.getElementById('sa-stat-courses')) document.getElementById('sa-stat-courses').innerText = data.courses;
    } catch(e) {}
}

// Add Center
async function saSaveCenter() {
    const data = {
        center_code: document.getElementById('input-cen-code').value, // Use auto-gen or manual
        center_name: document.getElementById('input-cen-name').value,
        password: document.getElementById('input-cen-pass').value,
        director_name: document.getElementById('input-cen-director').value,
        city: document.getElementById('input-cen-loc').value,
        state: document.getElementById('input-cen-state').value
    };

    if(!data.center_code || !data.center_name) { alert("Fill Details"); return; }

    const res = await fetch(`${API_URL}/api/admin/add-center`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    const result = await res.json();
    alert(res.ok ? "✅ Center Created" : "❌ Error: " + result.error);
}

// Add Student
async function saRegisterStudent() {
    const data = {
        name: document.getElementById('sa-reg-name').value,
        father_name: document.getElementById('sa-reg-father').value,
        enrollment_no: document.getElementById('sa-reg-roll').value,
        course: document.getElementById('sa-reg-course').value,
        center_code: document.getElementById('sa-reg-center').value,
        password: document.getElementById('sa-reg-pass').value,
        mobile: document.getElementById('sa-reg-mobile').value
    };

    const res = await fetch(`${API_URL}/api/admin/add-student`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    const result = await res.json();
    alert(res.ok ? "✅ Student Registered" : "❌ Error: " + result.error);
}

// Add Course
async function saSaveCourseData() {
    const data = {
        name: document.getElementById('ac-name').value,
        duration: document.getElementById('ac-sems').value + " Semesters",
        fee: "12000", // Add input field in HTML if needed
        description: document.getElementById('ac-desc').value,
        category: "Computer" // Default for now
    };

    const res = await fetch(`${API_URL}/api/admin/add-course`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    alert(res.ok ? "✅ Course Added" : "Failed");
}

// Add Notice
async function saAddNotice() {
    const title = document.getElementById('not-title').value;
    const date = document.getElementById('not-date').value;
    
    const res = await fetch(`${API_URL}/api/admin/add-notice`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ title, date })
    });
    alert(res.ok ? "✅ Notice Published" : "Failed");
}

// ==========================================
// 4. PUBLIC DATA LOADING (REAL OUTPUT)
// ==========================================

async function loadPublicData() {
    // Load Notices
    try {
        const res = await fetch(`${API_URL}/api/notices`);
        const notices = await res.json();
        const marquee = document.getElementById('public-news-marquee');
        if(marquee) {
            marquee.innerHTML = notices.map(n => `<p>🆕 ${n.title} (${n.date})</p>`).join('');
        }
    } catch(e) {}

    // Load Courses
    try {
        const res = await fetch(`${API_URL}/api/courses`);
        const courses = await res.json();
        const grid = document.getElementById('public-course-grid');
        if(grid) {
            grid.innerHTML = courses.map(c => `
                <div class="course-card" style="border:1px solid #ddd; padding:15px; border-radius:5px; background:white;">
                    <h3 style="margin:0; color:#0878f7;">${c.name}</h3>
                    <span style="font-size:12px; background:#eee; padding:2px 5px;">${c.duration}</span>
                    <p style="font-size:13px; color:#666;">${c.description || 'No description.'}</p>
                    <button class="btn btn-blue" onclick="navigate('contact')">Enroll Now</button>
                </div>
            `).join('');
        }
    } catch(e) {}
}

// Result Checker
async function showResult() {
    const roll = document.getElementById('res-roll').value;
    const area = document.getElementById('result-display-area');
    area.innerHTML = "Checking...";

    try {
        const res = await fetch(`${API_URL}/api/result/${roll}`);
        const data = await res.json();

        if(!res.ok) { area.innerHTML = "<b style='color:red'>Result Not Found</b>"; return; }

        let html = `<h4>${data.student.name} (${data.student.course})</h4><table border='1' width='100%'><tr><th>Subject</th><th>Marks</th></tr>`;
        data.marks.forEach(m => {
            html += `<tr><td>${m.subject_name}</td><td>${m.marks_obtained}/${m.max_marks}</td></tr>`;
        });
        html += "</table>";
        area.innerHTML = html;
    } catch(e) { area.innerHTML = "Error"; }
}

// Contact Form
async function handleContactSubmit(e) {
    e.preventDefault();
    const data = {
        name: document.getElementById('contact-name').value,
        phone: document.getElementById('contact-phone').value,
        message: document.getElementById('contact-msg').value,
        type: "Contact"
    };
    await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    alert("Message Sent!");
}

// ==========================================
// 5. HELPER FUNCTIONS
// ==========================================
function saGenerateNextCode() {
    const state = document.getElementById('input-cen-state').value;
    if(state) {
        // Random code generator for full functional feel
        const random = Math.floor(1000 + Math.random() * 9000);
        document.getElementById('input-cen-code').value = state + "-" + random;
    }
}

function loadStudentDashboard() {
    const s = JSON.parse(sessionStorage.getItem('student'));
    if(s) {
        if(document.getElementById('std-dash-name')) document.getElementById('std-dash-name').innerText = s.name;
        if(document.getElementById('std-dash-roll')) document.getElementById('std-dash-roll').innerText = s.enrollment_no;
    }
}

function logout() {
    sessionStorage.clear();
    navigate('home');
}

// Tab Switchers
function saTab(view, btn) {
    document.querySelectorAll('[id^="sa-view-"]').forEach(v => v.style.display='none');
    document.getElementById('sa-view-' + view).style.display='block';
}
function cenTab(view, btn) {
    document.querySelectorAll('.cen-view').forEach(v => v.style.display='none');
    document.getElementById('cen-view-' + view).style.display='block';
}
function switchStdTab(view, btn) {
    document.querySelectorAll('[id^="std-view-"]').forEach(v => v.style.display='none');
    document.getElementById('std-view-' + view).style.display='block';
}
/* =========================================
   2. AUTH SYSTEM (Server-Based Login)
   ========================================= */
const Auth = {

    // ---- LOGIN (Server ko request bhejega) ----
    login: async (role, username, password) => {
        // Validation
        if (!username || !password) {
            alert("Username aur Password dono likhna zaroori hai!");
            return;
        }

        // Loading state show karo (Optional: button disable karo)
        console.log(`🔐 Attempting ${role} login for: ${username}`);

        try {
            // Server ko POST request bhejo
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    role: role,
                    username: username.trim(),
                    password: password.trim()
                })
            });

            const result = await response.json();

            if (result.success) {
                // ✅ LOGIN SUCCESS!
                currentUser = result.user;
                userRole = role;

                // Session mein save karo (Page refresh par bhi rahe)
                sessionStorage.setItem('current_role', role);
                sessionStorage.setItem('current_user', JSON.stringify(result.user));

                // Role-specific session keys (Purana code compatible)
                if (role === 'student') {
                    sessionStorage.setItem('current_student', JSON.stringify(result.user));
                } else if (role === 'center') {
                    sessionStorage.setItem('current_center', JSON.stringify(result.user));
                }

                alert("✅ Login Successful! Welcome " + (result.user.name || result.user.director || 'User'));
                Auth.redirectAfterLogin(role);

            } else {
                // ❌ LOGIN FAILED
                alert("❌ " + (result.message || "Invalid Credentials!"));
            }

        } catch (error) {
            console.error("🔥 Login Error:", error);
            alert("⚠️ Server se connect nahi ho pa raha!\n\nCheck karo:\n1. Kya Node server chal raha hai? (npm start)\n2. API_URL sahi hai?");
        }
    },

    // ---- LOGIN KE BAAD REDIRECT ----
    redirectAfterLogin: (role) => {
        // Sabhi pages hide karo
        document.querySelectorAll('.page-section').forEach(p => {
            p.style.display = 'none';
            p.classList.remove('active-page');
        });

        if (role === 'student') {
            const page = document.getElementById('page-std-dashboard') || document.getElementById('page-student-dashboard');
            if (page) {
                page.style.display = 'block';
                page.classList.add('active-page');
                // Dashboard data load karo
                if (window.loadDashboard) window.loadDashboard();
            }
        }
        else if (role === 'center') {
            const page = document.getElementById('page-center-dashboard') || document.getElementById('page-cen-dashboard');
            if (page) {
                page.style.display = 'block';
                page.classList.add('active-page');
                // Full screen dashboard
                openCenterDashboard();
                if (window.loadCenterDash) window.loadCenterDash();
            }
        }
        else if (role === 'admin') {
            const page = document.getElementById('page-super-dashboard');
            if (page) {
                page.style.display = 'block';
                page.classList.add('active-page');
                // Admin specific setup
                document.querySelector('header').style.display = 'none';
                document.querySelector('.navbar').style.display = 'none';
                document.querySelector('.main-footer').style.display = 'none';
                if (window.loadAdminDashboard) window.loadAdminDashboard();
            }
        }
    },

    // ---- LOGOUT ----
    logout: () => {
        if (confirm("Kya aap logout karna chahte hain?")) {
            // Clear everything
            sessionStorage.clear();
            currentUser = null;
            userRole = null;

            // Show public headers back
            const header = document.querySelector('header');
            const navbar = document.querySelector('.navbar');
            const footer = document.querySelector('.main-footer');
            if (header) header.style.display = 'block';
            if (navbar) navbar.style.display = 'flex';
            if (footer) footer.style.display = 'block';

            // Home page par jao
            window.location.reload();
        }
    },

    // ---- CHECK SESSION (Page Reload par) ----
    checkSession: () => {
        const savedRole = sessionStorage.getItem('current_role');
        const savedUser = sessionStorage.getItem('current_user');

        if (savedRole && savedUser) {
            currentUser = JSON.parse(savedUser);
            userRole = savedRole;
            console.log(`♻️ Session restored: ${savedRole}`);
            return true;
        }
        return false;
    }
};
/* =========================================
   3. UPDATED DATA LOADERS (Server-Based)
   ========================================= */

// ---- CENTER DASHBOARD LOADER ----
async function loadCenterDash() {
    try {
        const center = JSON.parse(sessionStorage.getItem('current_center'));
        if (!center) {
            console.warn("No center data in session");
            return;
        }

        // Static Info Fill (Session se)
        setText('disp-welcome-name', center.director || center.name);
        setText('disp-center-name', center.name);
        setText('disp-center-code', center.code);
        setText('disp-director', center.director);
        setText('disp-address', center.location || 'India');
        setText('disp-wallet', center.wallet || '0.00');

        // ---- SERVER SE LIVE DATA LAO ----
        console.log(`📡 Fetching center data for: ${center.code}`);
        const res = await fetch(`${API_URL}/center-data/${center.code}`);
        const data = await res.json();

        if (data.success) {
            // Stats Update
            setText('cen-stat-students', data.stats.totalStudents);
            setText('cen-stat-active', data.stats.activeStudents);
            setText('cen-stat-total-pay', '₹' + data.stats.totalCollected);
            setText('cen-stat-dues', '₹' + data.stats.totalDues);

            // Student List Store (Tab switch ke liye)
            sessionStorage.setItem('center_students', JSON.stringify(data.students));

            console.log(`✅ Center data loaded: ${data.stats.totalStudents} students`);
        }

    } catch (error) {
        console.error("Center Dashboard Error:", error);
    }
}

// ---- CENTER STUDENT LIST RENDERER (Server-Based) ----
async function cenRenderStudentList() {
    const center = JSON.parse(sessionStorage.getItem('current_center'));
    if (!center) return;

    const tbody = document.querySelector('#cen-view-students tbody');
    if (!tbody) return;

    try {
        // Cache check (Pehle se loaded hai to wahi use karo)
        let students = JSON.parse(sessionStorage.getItem('center_students') || '[]');

        // Agar cache khali hai to server se fresh data lao
        if (students.length === 0) {
            const res = await fetch(`${API_URL}/center-data/${center.code}`);
            const data = await res.json();
            students = data.students || [];
            sessionStorage.setItem('center_students', JSON.stringify(students));
        }

        tbody.innerHTML = '';

        if (students.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" style="text-align:center; padding:20px; color:#666;">No students found. Add a new admission.</td></tr>';
            return;
        }

        students.forEach((s, index) => {
            tbody.innerHTML += `
                <tr style="border-bottom: 1px solid #eee;">
                    <td>${index + 1}</td>
                    <td style="font-weight:bold; color:#0878f7;">${s.roll}</td>
                    <td>${s.name}</td>
                    <td>${s.father || '-'}</td>
                    <td>${s.dob || '-'}</td>
                    <td><span class="badge bg-green">${s.course}</span></td>
                    <td><i class="fas fa-qrcode"></i></td>
                    <td>${s.center}</td>
                    <td style="color:green; font-weight:bold;">₹${s.feesPaid || 0}</td>
                    <td><button class="btn btn-blue" style="padding:4px 8px;"><i class="fas fa-eye"></i></button></td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("Student list render error:", error);
        tbody.innerHTML = '<tr><td colspan="10" style="text-align:center; padding:20px; color:red;">Data load karne mein error aaya. Server check karo.</td></tr>';
    }
}

// ---- STUDENT DASHBOARD LOADER (Server Session Based) ----
function loadDashboard() {
    console.log("Loading Student Dashboard...");

    const user = JSON.parse(sessionStorage.getItem('current_student'));
    if (!user) {
        console.warn("No student data in session");
        return;
    }

    currentUser = user;

    // --- A. STUDENT PANEL HEADER ---
    setText('std-dash-name', user.name);
    setText('std-dash-roll', "Roll No: " + user.roll);
    setText('std-dash-course', user.course);
    setImg('std-dash-img', user.img);

    // --- B. Fee & Attendance ---
    const due = (Number(user.feesTotal) || 0) - (Number(user.feesPaid) || 0);
    setText('std-dash-due', '₹' + due);
    setText('std-dash-att', (user.attendance || 0) + '%');

    // --- C. ID CARD ---
    setText('id-card-name', user.name);
    setText('id-card-roll-in', user.roll);
    setText('id-card-course-in', user.course);
    setText('id-card-center', user.center);
    setText('id-card-father', user.father);
    setText('id-card-dob', user.dob);
    setText('id-enroll', user.roll);
    setText('id-father', user.father ? user.father.toUpperCase() : 'MR. FATHER');
    setText('id-dob', user.dob);
    setText('id-course', user.course);
    setText('id-mobile', user.mobile || '');
    setImg('id-card-photo', user.img);
    setImg('id-photo-final', user.img);

    // --- D. MARKSHEET ---
    setText('mrk-name', user.name ? user.name.toUpperCase() : '');
    setText('mrk-father', user.father ? user.father.toUpperCase() : 'MR. FATHER');
    setText('mrk-course', user.course);
    setText('mrk-reg-no', user.roll);
    setText('mrk-date', new Date().toLocaleDateString());
    setImg('mrk-photo', user.img);

    // --- E. CERTIFICATE ---
    setText('cert-name', user.name ? user.name.toUpperCase() : '');
    setText('cert-father', user.father ? user.father.toUpperCase() : 'MR. FATHER');
    setText('cert-course', user.course);
    setText('cert-roll', user.roll);
    setText('cert-dob', user.dob);
    setImg('cert-photo', user.img);

    // --- F. DIPLOMA ---
    setText('dip-name', user.name ? user.name.toUpperCase() : '');
    setText('dip-course', user.course);
    setText('dip-roll', user.roll);
    setText('dip-dob', user.dob);
    setImg('dip-photo', user.img);

    console.log("✅ Student Dashboard Loaded!");
}

// ---- ADMIN DASHBOARD LOADER (Server-Based) ----
async function loadAdminDashboard() {
    try {
        // Server se live stats lao
        const res = await fetch(`${API_URL}/stats`);
        const data = await res.json();

        if (data.success) {
            setText('sa-stat-students', data.stats.totalStudents);
            setText('sa-stat-active', data.stats.totalCenters);
            setText('sa-stat-courses', data.stats.totalCourses);
        }

        // Date
        setText('sa-date-display', new Date().toDateString());

    } catch (error) {
        console.error("Admin dashboard error:", error);
    }
}

// ---- PUBLIC COURSES LOADER (Server-Based) ----
async function renderPublicCourses(searchTerm, sortType) {
    const grid = document.getElementById('public-course-grid');
    if (!grid) return;

    try {
        const res = await fetch(`${API_URL}/courses`);
        const data = await res.json();

        if (!data.success || !data.courses) {
            grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:50px; color:#666;">No courses available.</div>';
            return;
        }

        let courses = data.courses;

        // Search Filter (Client-side)
        const searchInput = document.getElementById('public-course-search');
        const search = searchTerm || (searchInput ? searchInput.value.toLowerCase() : "");

        if (search) {
            courses = courses.filter(c =>
                c.name.toLowerCase().includes(search) ||
                (c.desc || '').toLowerCase().includes(search) ||
                (c.cat || '').toLowerCase().includes(search)
            );
        }

        // Sort (Client-side)
        const sortInput = document.getElementById('public-course-sort');
        const sort = sortType || (sortInput ? sortInput.value : "newest");

        if (sort === 'name') {
            courses.sort((a, b) => a.name.localeCompare(b.name));
        }

        grid.innerHTML = '';

        if (courses.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 50px;">
                    <i class="fas fa-box-open" style="font-size: 40px; color: #ddd; margin-bottom: 10px;"></i>
                    <p style="color: #666;">No courses found matching "${search}"</p>
                </div>
            `;
            return;
        }

        courses.forEach(c => {
            const imgUrl = c.img || "https://via.placeholder.com/400x250?text=Course";

            grid.innerHTML += `
                <div class="course-card-modern">
                    <div class="course-img-wrap">
                        <img src="${imgUrl}" alt="${c.name}">
                        <div class="course-badge">${c.cat || 'Course'}</div>
                    </div>
                    <div class="course-info">
                        <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #333;">${c.name}</h3>
                        <div class="course-meta">
                            <span><i class="far fa-clock"></i> ${c.duration || 'N/A'}</span>
                            <span><i class="fas fa-user-graduate"></i> ${c.elig || '10th Pass'}</span>
                        </div>
                        <p style="font-size: 13px; color: #555; line-height: 1.5; margin-bottom: 20px; flex: 1;">
                            ${(c.desc || '').substring(0, 80)}...
                        </p>
                        <div class="course-btn-grp">
                            <button class="btn btn-outline" style="flex: 1; font-size: 13px;" onclick="alert('Downloading Syllabus for ${c.name}...')">
                                <i class="fas fa-download"></i> Syllabus
                            </button>
                            <button class="btn btn-blue" style="flex: 1; font-size: 13px;" onclick="navigate('admission')">
                                Enroll Now
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

    } catch (error) {
        console.error("Course render error:", error);
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:50px; color:red;">Server se courses load nahi ho paaye. Try again later.</div>';
    }
}

// ---- SUGGESTION SUBMIT (Server-Based) ----
async function submitSuggestion() {
    const name = document.getElementById('sug-name').value || "Anonymous";
    const mobile = document.getElementById('sug-mobile').value || "N/A";
    const text = document.getElementById('sug-text').value;

    if (!text.trim()) {
        alert("Please write your suggestion first.");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/suggestions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, mobile, message: text.trim() })
        });

        const data = await res.json();

        if (data.success) {
            alert("✅ Thank you! Your suggestion has been sent to the Super Admin.");
            document.getElementById('sug-text').value = "";
            document.getElementById('sug-name').value = "";
            document.getElementById('sug-mobile').value = "";
            closeSuggestionModal();
        } else {
            alert("❌ " + (data.message || "Could not send suggestion."));
        }

    } catch (error) {
        alert("⚠️ Server se connect nahi ho paya. Try again.");
    }
}

// ---- ADMIN: RENDER SUGGESTIONS (Server-Based) ----
async function saRenderSuggestions() {
    const tbody = document.getElementById('sa-sug-list');
    const badge = document.getElementById('sa-sug-badge');

    if (!tbody) {
        console.warn("Table ID 'sa-sug-list' not found in HTML");
        return;
    }

    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px;">Loading...</td></tr>';

    try {
        const res = await fetch(`${API_URL}/suggestions`);
        const data = await res.json();

        const list = data.suggestions || [];

        // Badge Update
        if (badge) {
            badge.innerText = list.length > 0 ? list.length : '0';
            badge.style.display = list.length > 0 ? 'inline-block' : 'none';
        }

        tbody.innerHTML = '';

        if (list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:30px; color:#999;">No suggestions found.</td></tr>';
            return;
        }

        list.forEach(item => {
            tbody.innerHTML += `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding:12px; color:#666;">${new Date(item.created_at).toLocaleDateString()}</td>
                    <td style="padding:12px;">
                        <strong>${item.name || 'Anonymous'}</strong><br>
                        <small>${item.mobile || ''}</small>
                    </td>
                    <td style="padding:12px;">${item.message || ''}</td>
                    <td style="padding:12px; text-align:center;">
                        <button onclick="saDeleteSuggestion(${item.id})" style="color:red; border:none; background:none; cursor:pointer;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("Suggestion load error:", error);
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:red;">Server error. Try again.</td></tr>';
    }
}

// ---- ADMIN: DELETE SUGGESTION ----
async function saDeleteSuggestion(id) {
    if (!confirm("Delete this suggestion?")) return;

    try {
        const res = await fetch(`${API_URL}/suggestions/${id}`, { method: 'DELETE' });
        const data = await res.json();

        if (data.success) {
            saRenderSuggestions(); // Refresh list
        } else {
            alert("Delete failed: " + data.message);
        }
    } catch (error) {
        alert("Server error!");
    }
}

// ---- ADMIN: CLEAR ALL SUGGESTIONS ----
async function saClearSuggestions() {
    if (!confirm("Are you sure you want to delete ALL suggestions?")) return;

    try {
        const res = await fetch(`${API_URL}/suggestions`, { method: 'DELETE' });
        const data = await res.json();

        if (data.success) {
            saRenderSuggestions();
        }
    } catch (error) {
        alert("Server error!");
    }
}

// ---- ADMIN: RENDER CENTERS (Server-Based) ----
async function saRenderCenters() {
    const list = document.getElementById('sa-center-list');
    if (!list) return;

    list.innerHTML = '<tr><td colspan="4" style="text-align:center;">Loading...</td></tr>';

    try {
        const res = await fetch(`${API_URL}/centers`);
        const data = await res.json();

        list.innerHTML = '';
        const centers = data.centers || [];

        if (centers.length === 0) {
            list.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px;">No centers found.</td></tr>';
            return;
        }

        centers.forEach(c => {
            list.innerHTML += `
                <tr>
                    <td><strong>${c.code}</strong><br><small>${c.state}</small></td>
                    <td>${c.name}<br><small>Dir: ${c.director || 'N/A'}</small></td>
                    <td>${c.valid_upto || 'N/A'}</td>
                    <td>
                        <button class="btn btn-red" style="font-size:10px; padding:5px;" 
                            onclick="saBlockCenter('${c.code}', ${!c.is_blocked})">
                            ${c.is_blocked ? 'Unblock' : 'Block'}
                        </button>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        list.innerHTML = '<tr><td colspan="4" style="color:red;">Error loading centers.</td></tr>';
    }
}

// ---- ADMIN: BLOCK/UNBLOCK CENTER ----
async function saBlockCenter(code, blocked) {
    const action = blocked ? 'BLOCK' : 'UNBLOCK';
    if (!confirm(`${action} center ${code}?`)) return;

    try {
        const res = await fetch(`${API_URL}/centers/${code}/block`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ blocked })
        });
        const data = await res.json();

        if (data.success) {
            alert(data.message);
            saRenderCenters();
        }
    } catch (error) {
        alert("Server error!");
    }
}

// ---- ADMIN: ADD CENTER (Server-Based) ----
async function saAddCenter() {
    const state = document.getElementById('input-cen-state').value;
    const name = document.getElementById('input-cen-name').value;
    const pass = document.getElementById('input-cen-pass').value;
    const director = document.getElementById('input-cen-director').value;
    const loc = document.getElementById('input-cen-loc').value;

    if (!state || !name || !pass) {
        alert("State, Center Name, aur Password fill karo!");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/centers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ state, name, password: pass, director, location: loc })
        });

        const data = await res.json();

        if (data.success) {
            alert("✅ " + data.message);
            document.getElementById('input-cen-name').value = "";
            document.getElementById('input-cen-pass').value = "";
            document.getElementById('input-cen-director').value = "";
            document.getElementById('input-cen-loc').value = "";
            saRenderCenters();
        } else {
            alert("❌ " + data.message);
        }
    } catch (error) {
        alert("Server error!");
    }
}

// ---- ADMIN: RENDER ALL STUDENTS (Server-Based) ----
async function saRenderStudents() {
    const list = document.getElementById('sa-student-list');
    if (!list) return;

    try {
        const res = await fetch(`${API_URL}/students`);
        const data = await res.json();

        list.innerHTML = '';
        (data.students || []).forEach((s, i) => {
            list.innerHTML += `
                <tr>
                    <td>${i + 1}</td>
                    <td style="font-weight:bold;">${s.roll}</td>
                    <td>${s.name}</td>
                    <td>${s.course}</td>
                    <td>${s.center}</td>
                    <td style="color:green;">₹${s.fees_paid || 0}</td>
                </tr>
            `;
        });

    } catch (error) {
        list.innerHTML = '<tr><td colspan="6" style="color:red;">Error loading students.</td></tr>';
    }
}

// ---- ADMIN: ADD COURSE (Server-Based) ----
async function saAddCourse() {
    const name = document.getElementById('ac-name').value;
    const duration = document.getElementById('ac-duration').value;
    const fee = document.getElementById('ac-fee').value;

    if (!name) {
        alert("Course Name is required!");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/courses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, duration, fee })
        });

        const data = await res.json();

        if (data.success) {
            alert("✅ " + data.message);
            document.getElementById('ac-name').value = "";
            saRenderCourses();
            renderPublicCourses();
        }
    } catch (error) {
        alert("Server error!");
    }
}

// ---- ADMIN: RENDER COURSES ----
async function saRenderCourses() {
    const list = document.getElementById('ac-course-list');
    if (!list) return;

    try {
        const res = await fetch(`${API_URL}/courses`);
        const data = await res.json();

        list.innerHTML = '';
        (data.courses || []).forEach(c => {
            list.innerHTML += `
                <div class="ac-item">
                    <div>
                        <h4>${c.name}</h4>
                        <p>${c.duration || 'N/A'} | ₹${c.fee || '0'}</p>
                    </div>
                    <button class="btn btn-blue" style="font-size:10px; padding:4px;">Edit</button>
                </div>
            `;
        });
    } catch (error) {
        list.innerHTML = '<p style="color:red;">Error loading courses.</p>';
    }
}

// ---- CENTER: ADD STUDENT ADMISSION (Server-Based) ----
async function cenSubmitAdmission() {
    const center = JSON.parse(sessionStorage.getItem('current_center'));
    if (!center) {
        alert("Login expired! Re-login karo.");
        return;
    }

    const roll = document.getElementById('adm-roll').value.trim().toUpperCase();
    const name = document.getElementById('adm-name').value.trim();
    const father = document.getElementById('adm-father').value.trim();
    const dob = document.getElementById('adm-dob').value;
    const course = document.getElementById('adm-course').value;
    const password = document.getElementById('adm-password').value;
    const mobile = document.getElementById('adm-mobile').value;
    const feesTotal = document.getElementById('adm-fees').value;

    if (!roll || !name || !course || !password) {
        alert("Roll, Name, Course, Password - sab fill karo!");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/students`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                roll, name, father, dob, course,
                center: center.code,
                password, mobile,
                fees_total: feesTotal || 0
            })
        });

        const data = await res.json();

        if (data.success) {
            alert("✅ " + data.message);
            // Clear form
            ['adm-roll', 'adm-name', 'adm-father', 'adm-dob', 'adm-password', 'adm-mobile', 'adm-fees'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            // Refresh student list
            sessionStorage.removeItem('center_students'); // Clear cache
            cenRenderStudentList();
        } else {
            alert("❌ " + data.message);
        }

    } catch (error) {
        alert("Server error! Student add nahi ho paya.");
    }
}

// ---- CENTER: COLLECT FEE (Server-Based) ----
async function cenCollectFee() {
    const roll = document.getElementById('fee-roll').value.trim().toUpperCase();
    const amount = document.getElementById('fee-amount').value;

    if (!roll || !amount) {
        alert("Roll Number aur Amount dono daalo!");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/collect-fee`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roll, amount: Number(amount) })
        });

        const data = await res.json();

        if (data.success) {
            alert("✅ " + data.message);
            document.getElementById('fee-roll').value = '';
            document.getElementById('fee-amount').value = '';
            // Refresh dashboard stats
            sessionStorage.removeItem('center_students');
            loadCenterDash();
        } else {
            alert("❌ " + data.message);
        }
    } catch (error) {
        alert("Server error!");
    }
}

// ---- PUBLIC: VERIFY CENTER (Server-Based) ----
async function verifyCenter() {
    const code = document.getElementById('chk-center-code').value.trim().toUpperCase();
    const resultBox = document.getElementById('center-verify-result');

    if (!code) {
        alert("Please enter a Center Code!");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/verify-center/${code}`);
        const data = await res.json();

        if (data.success) {
            resultBox.innerHTML = `
                <div style="background:#dcfce7; color:#166534; padding:10px; border:1px solid #166534; border-radius:5px;">
                    <i class="fas fa-check-circle"></i> <strong>Verified Successfully!</strong><br>
                    ${data.center.name}<br>
                    <small>State: ${data.center.state} | Director: ${data.center.director || 'N/A'}</small>
                </div>`;
        } else {
            resultBox.innerHTML = `
                <div style="background:#fee2e2; color:#991b1b; padding:10px; border:1px solid #991b1b; border-radius:5px;">
                    <i class="fas fa-times-circle"></i> <strong>Invalid Center Code</strong><br>
                    This code does not exist in our records.
                </div>`;
        }
    } catch (error) {
        resultBox.innerHTML = '<div style="color:red;">Server error. Try again.</div>';
    }
}

// ---- PUBLIC: VERIFY CERTIFICATE (Server-Based) ----
async function verifyCertificate() {
    const roll = document.getElementById('chk-cert-roll').value.trim().toUpperCase();
    const resultBox = document.getElementById('cert-verify-result');

    if (!roll) {
        alert("Please enter Roll Number!");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/verify-certificate/${roll}`);
        const data = await res.json();

        if (data.success) {
            resultBox.innerHTML = `
                <div style="background:#dcfce7; border:1px solid #166534; padding:15px; border-radius:5px; color:#14532d;">
                    <div style="display:flex; align-items:center; gap:10px; margin-bottom:5px;">
                        <i class="fas fa-check-circle" style="font-size:20px;"></i>
                        <span style="font-weight:bold; font-size:16px;">Verified Successfully</span>
                    </div>
                    <hr style="border:0; border-top:1px solid #bbf7d0; margin:8px 0;">
                    <p style="margin:3px 0; font-size:13px;"><strong>Name:</strong> ${data.student.name}</p>
                    <p style="margin:3px 0; font-size:13px;"><strong>Course:</strong> ${data.student.course}</p>
                    <p style="margin:3px 0; font-size:13px;"><strong>Status:</strong> ${data.student.status}</p>
                </div>
            `;
        } else {
            resultBox.innerHTML = `
                <div style="background:#fee2e2; border:1px solid #991b1b; padding:15px; border-radius:5px; color:#991b1b; text-align:center;">
                    <i class="fas fa-times-circle" style="font-size:24px; margin-bottom:5px;"></i><br>
                    <strong>Record Not Found</strong><br>
                    <span style="font-size:12px;">This Roll Number does not exist in our database.</span>
                </div>
            `;
        }
    } catch (error) {
        resultBox.innerHTML = '<div style="color:red;">Server error. Try again.</div>';
    }
}

// ---- PUBLIC: SHOW RESULT (Server-Based) ----
async function showResult() {
    const roll = document.getElementById('res-roll').value.trim().toUpperCase();
    const area = document.getElementById('result-display-area');

    if (!roll) {
        alert("Enter Roll Number first!");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/result/${roll}`);
        const data = await res.json();

        if (data.success) {
            const r = data.result;
            area.innerHTML = `
                <div style="border: 2px solid #0878f7; padding: 15px; border-radius: 8px; background: #fdfdfd;">
                    <div style="text-align:center; border-bottom:1px solid #ccc; padding-bottom:10px; margin-bottom:10px;">
                        <h4 style="margin:0; color:#333;">${r.name}</h4>
                        <span style="font-size:12px; color:#666;">Course: ${r.course} | Roll: ${r.roll}</span>
                    </div>
                    <table style="width:100%; font-size:13px; margin-bottom:10px;">
                        <tr style="background:#eee;"><th style="text-align:left; padding:5px;">Subject</th><th style="text-align:right; padding:5px;">Marks</th></tr>
                        <tr><td style="padding:5px;">Theory</td><td style="text-align:right;">${r.marks.theory}</td></tr>
                        <tr><td style="padding:5px;">Practical</td><td style="text-align:right;">${r.marks.practical}</td></tr>
                        <tr><td style="padding:5px;">Viva / Project</td><td style="text-align:right;">${r.marks.viva}</td></tr>
                        <tr style="border-top:1px solid #ccc; font-weight:bold;">
                            <td style="padding:8px 5px;">Total Score</td>
                            <td style="text-align:right; padding:8px 5px; color:#0878f7;">${r.total}</td>
                        </tr>
                    </table>
                    <div style="text-align:center; background:#dcfce7; color:#166534; padding:5px; border-radius:4px; font-weight:bold;">
                        Result: ${r.status} (Grade ${r.grade})
                    </div>
                </div>
            `;
        } else {
            area.innerHTML = `
                <div style="text-align:center; color:red; padding:20px; background:#fee2e2; border-radius:5px;">
                    <i class="fas fa-exclamation-circle"></i> Roll Number Not Found.
                </div>
            `;
        }
    } catch (error) {
        area.innerHTML = '<div style="color:red; text-align:center; padding:20px;">Server error. Try again.</div>';
    }
}

// ---- GALLERY SLIDER (Server-Based) ----
async function startHomeGallerySlider() {
    const imgEl = document.getElementById('home-gallery-slider');
    const capEl = document.getElementById('home-gallery-caption');

    if (!imgEl) return;

    let images = [];

    try {
        const res = await fetch(`${API_URL}/gallery`);
        const data = await res.json();

        if (data.success && data.gallery.length > 0) {
            images = data.gallery;
        }
    } catch (e) {
        console.log("Gallery fetch failed, using defaults");
    }

    // Default images agar server se nahi aaye
    if (images.length === 0) {
        images = [
            { title: "Smart Classroom", img: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800" },
            { title: "Computer Lab", img: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800" },
            { title: "Award Ceremony", img: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800" }
        ];
    }

    let i = 0;

    imgEl.src = images[0].img;
    if (capEl) capEl.innerText = images[0].title || "Lifeway Gallery";

    const setSlide = () => {
        imgEl.style.opacity = 0;
        setTimeout(() => {
            imgEl.src = images[i].img;
            if (capEl) capEl.innerText = images[i].title || "Lifeway Gallery";
            i = (i + 1) % images.length;
            imgEl.style.opacity = 1;
        }, 800);
    };

    setInterval(setSlide, 3000);
}
/* =========================================
   HELPER FUNCTIONS (Same - No Change)
   ========================================= */
function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.innerText = val !== undefined && val !== null ? String(val) : '--';
}

function setImg(id, src) {
    const el = document.getElementById(id);
    if (el && src) el.src = src;
}

/* =========================================
   NAVIGATION SERVICE (Same - No Change)
   ========================================= */
function navigate(pageId) {
    document.querySelectorAll('.page-section').forEach(el => {
        el.classList.remove('active-page');
    });

    const target = document.getElementById('page-' + pageId);
    if (target) {
        target.classList.add('active-page');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        console.error(`Page ID 'page-${pageId}' not found.`);
    }
}

function toggleForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.style.display = (form.style.display === 'none' || form.style.display === '') ? 'block' : 'none';
    }
}

/* =========================================
   GLOBAL WINDOW BINDINGS
   ========================================= */
// Navigation
window.navigate = navigate;
window.logout = Auth.logout;

// Login Wrappers (HTML onclick se call honge)
window.studentLogin = () => Auth.login('student', document.getElementById('std-user').value, document.getElementById('std-pass').value);
window.centerLogin = () => Auth.login('center', document.getElementById('cen-user').value, document.getElementById('cen-pass').value);
window.saLogin = () => Auth.login('admin', document.getElementById('sa-login-user').value, document.getElementById('sa-login-pass').value);

// Student Wrappers
window.loadDashboard = loadDashboard;
window.switchStdTab = function(tabName, btn) {
    ['home', 'idcard', 'marks', 'attendance'].forEach(t => {
        const el = document.getElementById('std-view-' + t);
        if (el) el.style.display = 'none';
    });
    const target = document.getElementById('std-view-' + tabName);
    if (target) target.style.display = 'block';

    // Reset btn styles
    const btns = document.getElementsByClassName('std-menu-btn');
    for (let i = 0; i < btns.length; i++) {
        btns[i].style.background = 'transparent';
        btns[i].style.color = '#555';
    }
    if (btn) {
        btn.style.background = '#f0f9ff';
        btn.style.color = '#0878f7';
    }

    if (tabName === 'idcard') loadIDCardData();
    if (tabName === 'marks') loadMarksheetData();
};

window.stdDownloadID = function() {
    const printContent = document.getElementById('printable-id-card');
    if (printContent) {
        const original = document.body.innerHTML;
        document.body.innerHTML = "<br><br><center>" + printContent.outerHTML + "</center>";
        window.print();
        document.body.innerHTML = original;
        location.reload();
    }
};

// Center Wrappers
window.cenTab = function(viewName, btn) {
    const allViews = document.querySelectorAll('div[id^="cen-view-"]');
    allViews.forEach(view => {
        view.style.display = 'none';
        view.classList.remove('active-view');
    });

    const target = document.getElementById('cen-view-' + viewName);
    if (target) {
        target.style.display = 'block';
        setTimeout(() => target.classList.add('active-view'), 10);

        if (viewName === 'dashboard') loadCenterDash();
        if (viewName === 'students') cenRenderStudentList();
        if (viewName === 'exams') { if (window.cenRenderExams) cenRenderExams(); }
    }

    if (btn) {
        document.querySelectorAll('.cen-menu-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }
};

window.loadCenterDash = loadCenterDash;
window.cenSubmitAdmission = cenSubmitAdmission;
window.cenCollectFee = cenCollectFee;

window.cenShowAdmissionForm = () => {
    const students = document.getElementById('cen-view-students');
    const admission = document.getElementById('cen-view-admission');
    if (students) students.style.display = 'none';
    if (admission) admission.style.display = 'block';
};

window.cenHideAdmissionForm = () => {
    const admission = document.getElementById('cen-view-admission');
    const students = document.getElementById('cen-view-students');
    if (admission) admission.style.display = 'none';
    if (students) students.style.display = 'block';
};

// Admin Wrappers
window.loadAdminDashboard = loadAdminDashboard;
window.saAddCenter = saAddCenter;
window.saAddCourse = saAddCourse;
window.saRenderSuggestions = saRenderSuggestions;
window.saDeleteSuggestion = saDeleteSuggestion;
window.saClearSuggestions = saClearSuggestions;
window.saBlockCenter = saBlockCenter;

window.saTab = function(viewId, btn) {
    document.querySelectorAll('.sa-menu-item').forEach(item => item.classList.remove('active'));
    if (btn) btn.classList.add('active');

    document.querySelectorAll('[id^="sa-view-"]').forEach(view => {
        view.style.setProperty('display', 'none', 'important');
    });

    const target = document.getElementById('sa-view-' + viewId);
    if (target) {
        target.style.setProperty('display', 'block', 'important');
        if (viewId === 'centers') saRenderCenters();
        if (viewId === 'students') saRenderStudents();
        if (viewId === 'academics') saRenderCourses();
        if (viewId === 'suggestions') saRenderSuggestions();
        if (viewId === 'docs') { if (window.saSwitchDocTab) saSwitchDocTab('documents'); }
    }
};

// Public Wrappers
window.renderPublicCourses = renderPublicCourses;
window.submitSuggestion = submitSuggestion;
window.verifyCenter = verifyCenter;
window.verifyCertificate = verifyCertificate;
window.showResult = showResult;

// Modal Wrappers (Same as before - no change needed)
window.openModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'flex';
};
window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
};

/* =========================================
   INITIALIZATION (Page Load)
   ========================================= */
window.addEventListener('load', async function () {
    console.log("🎓 Lifeway LMS Initializing...");

    // 1. Check for existing session
    if (Auth.checkSession()) {
        const role = sessionStorage.getItem('current_role');
        Auth.redirectAfterLogin(role);
    }

    // 2. Render Public Data (Async - Server se)
    await renderPublicCourses();

    // 3. Gallery Slider
    startHomeGallerySlider();

    // 4. Activity Slider (Demo data - no change)
    if (document.getElementById('home-recent-student')) {
        updateDashboardActivity();
        setInterval(updateDashboardActivity, 3000);
    }

    // 5. Hero Slider
    let slideIndex = 0;
    const slides = document.querySelectorAll('.sg-slide');
    if (slides.length > 0) {
        setInterval(() => {
            slides.forEach(s => s.classList.remove('active'));
            slideIndex = (slideIndex + 1) % slides.length;
            slides[slideIndex].classList.add('active');
        }, 4000);
    }

    console.log("✅ LMS Initialization Complete!");
});
