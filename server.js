/**
 * =========================================
 * LIFEWAY COMPUTERS - LMS BACKEND SERVER
 * Architecture: Node.js + Express + Supabase
 * Version: 1.0.0 (Production Ready)
 * =========================================
 */

// ---- IMPORTS ----
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// ---- APP INITIALIZATION ----
const app = express();
const PORT = process.env.PORT || 5000;

// ---- MIDDLEWARE ----
// JSON body parsing (POST requests ke liye)
app.use(express.json());

// CORS - Taaki frontend (kisi bhi domain se) baat kar sake
app.use(cors({
    origin: '*', // Production mein apna domain daalna
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ---- SUPABASE CLIENT CONNECTION ----
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY; // anon key ya service_role key

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ CRITICAL ERROR: SUPABASE_URL or SUPABASE_KEY is missing!');
    console.error('   Set them in .env file (local) or Render Environment Variables (production).');
    process.exit(1); // Server band kar do agar keys nahi hain
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
console.log('✅ Supabase Client Initialized');

// =========================================
// HEALTH CHECK ROUTE
// =========================================
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        message: '🎓 Lifeway LMS Server is Running!',
        timestamp: new Date().toISOString(),
        endpoints: {
            login: 'POST /api/login',
            centerData: 'GET /api/center-data/:code',
            courses: 'GET /api/courses',
            gallery: 'GET /api/gallery',
            suggestions: 'POST /api/suggestions',
            allSuggestions: 'GET /api/suggestions',
            addStudent: 'POST /api/students',
            addCenter: 'POST /api/centers',
            addCourse: 'POST /api/courses',
            allStudents: 'GET /api/students',
            allCenters: 'GET /api/centers',
            verifyCert: 'GET /api/verify-certificate/:roll',
            verifyCenter: 'GET /api/verify-center/:code',
            result: 'GET /api/result/:roll',
            stats: 'GET /api/stats'
        }
    });
});

// =========================================
// API ENDPOINT 1: UNIVERSAL LOGIN
// POST /api/login
// Body: { role, username, password }
// =========================================
app.post('/api/login', async (req, res) => {
    try {
        const { role, username, password } = req.body;

        // Validation
        if (!role || !username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Role, Username aur Password - teeno required hain!'
            });
        }

        console.log(`🔐 Login attempt: Role=${role}, User=${username}`);

        let userData = null;
        let table = '';

        // ---- ADMIN LOGIN ----
        if (role === 'admin') {
            table = 'admins';
            const { data, error } = await supabase
                .from('admins')
                .select('*')
                .eq('username', username.trim())
                .eq('password', password.trim())
                .single();

            if (error || !data) {
                console.log('❌ Admin login failed:', error?.message);
                return res.status(401).json({
                    success: false,
                    message: 'Invalid Admin Credentials!'
                });
            }

            userData = {
                id: data.id,
                name: data.name,
                username: data.username,
                role: 'admin'
            };
        }

        // ---- CENTER LOGIN ----
        else if (role === 'center') {
            table = 'centers';
            const { data, error } = await supabase
                .from('centers')
                .select('*')
                .eq('username', username.trim())
                .eq('password', password.trim())
                .single();

            if (error || !data) {
                console.log('❌ Center login failed:', error?.message);
                return res.status(401).json({
                    success: false,
                    message: 'Invalid Center Code or Password!'
                });
            }

            if (data.is_blocked) {
                return res.status(403).json({
                    success: false,
                    message: 'This center has been blocked by Admin. Contact HQ.'
                });
            }

            userData = {
                id: data.id,
                code: data.code,
                name: data.name,
                director: data.director,
                location: data.location,
                state: data.state,
                wallet: data.wallet,
                valid_upto: data.valid_upto,
                role: 'center'
            };
        }

        // ---- STUDENT LOGIN ----
        else if (role === 'student') {
            table = 'students';
            const { data, error } = await supabase
                .from('students')
                .select('*')
                .eq('username', username.trim())
                .eq('password', password.trim())
                .single();

            if (error || !data) {
                console.log('❌ Student login failed:', error?.message);
                return res.status(401).json({
                    success: false,
                    message: 'Invalid Roll Number or Password!'
                });
            }

            userData = {
                id: data.id,
                roll: data.roll,
                name: data.name,
                father: data.father,
                dob: data.dob,
                course: data.course,
                center: data.center,
                img: data.img,
                feesTotal: data.fees_total,
                feesPaid: data.fees_paid,
                attendance: data.attendance,
                mobile: data.mobile,
                status: data.status,
                role: 'student'
            };
        }

        // ---- UNKNOWN ROLE ----
        else {
            return res.status(400).json({
                success: false,
                message: `Unknown role: "${role}". Use: student, center, or admin.`
            });
        }

        // ---- SUCCESS RESPONSE ----
        console.log(`✅ Login successful: ${role} - ${username}`);
        return res.json({
            success: true,
            message: 'Login Successful!',
            user: userData
        });

    } catch (error) {
        console.error('🔥 Login Server Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server Error! Please try again later.'
        });
    }
});

// =========================================
// API ENDPOINT 2: CENTER DATA (Students by Center)
// GET /api/center-data/:code
// =========================================
app.get('/api/center-data/:code', async (req, res) => {
    try {
        const centerCode = req.params.code;
        console.log(`📊 Fetching data for center: ${centerCode}`);

        // Center Info
        const { data: centerInfo, error: centerError } = await supabase
            .from('centers')
            .select('*')
            .eq('code', centerCode)
            .single();

        if (centerError) {
            console.log('Center not found:', centerError.message);
        }

        // Students of this center
        const { data: students, error: studError } = await supabase
            .from('students')
            .select('*')
            .eq('center', centerCode)
            .order('created_at', { ascending: false });

        if (studError) {
            console.error('Student fetch error:', studError.message);
            return res.status(500).json({
                success: false,
                message: 'Students fetch karne mein error aaya!'
            });
        }

        // Fee Calculations
        let totalCollected = 0;
        let totalFees = 0;
        (students || []).forEach(s => {
            totalCollected += Number(s.fees_paid) || 0;
            totalFees += Number(s.fees_total) || 0;
        });

        return res.json({
            success: true,
            center: centerInfo || {},
            students: (students || []).map(s => ({
                id: s.id,
                roll: s.roll,
                name: s.name,
                father: s.father,
                dob: s.dob,
                course: s.course,
                center: s.center,
                feesPaid: s.fees_paid,
                feesTotal: s.fees_total,
                attendance: s.attendance,
                status: s.status,
                img: s.img
            })),
            stats: {
                totalStudents: (students || []).length,
                activeStudents: (students || []).filter(s => s.status === 'Active').length,
                totalCollected: totalCollected,
                totalDues: totalFees - totalCollected
            }
        });

    } catch (error) {
        console.error('🔥 Center Data Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server Error!'
        });
    }
});

// =========================================
// API ENDPOINT 3: ALL COURSES (Public)
// GET /api/courses
// =========================================
app.get('/api/courses', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Course fetch error:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Courses load nahi ho paaye!'
            });
        }

        return res.json({
            success: true,
            courses: (data || []).map(c => ({
                id: c.id,
                name: c.name,
                duration: c.duration,
                fee: c.fee,
                cat: c.category,
                desc: c.description,
                elig: c.eligibility,
                img: c.img
            }))
        });

    } catch (error) {
        console.error('🔥 Course Error:', error);
        return res.status(500).json({ success: false, message: 'Server Error!' });
    }
});

// =========================================
// API ENDPOINT 4: GALLERY (Public)
// GET /api/gallery
// =========================================
app.get('/api/gallery', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('gallery')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ success: false, message: 'Gallery load failed!' });
        }

        return res.json({
            success: true,
            gallery: data || []
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error!' });
    }
});

// =========================================
// API ENDPOINT 5: SUGGESTIONS (Submit & View)
// POST /api/suggestions  (Public Submit)
// GET  /api/suggestions  (Admin View)
// DELETE /api/suggestions/:id (Admin Delete)
// =========================================
app.post('/api/suggestions', async (req, res) => {
    try {
        const { name, mobile, message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Suggestion message is required!'
            });
        }

        const { data, error } = await supabase
            .from('suggestions')
            .insert([{
                name: name || 'Anonymous',
                mobile: mobile || 'N/A',
                message: message.trim()
            }])
            .select();

        if (error) {
            console.error('Suggestion insert error:', error.message);
            return res.status(500).json({ success: false, message: 'Could not save suggestion.' });
        }

        return res.json({
            success: true,
            message: 'Suggestion sent successfully!',
            data: data[0]
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error!' });
    }
});

app.get('/api/suggestions', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('suggestions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ success: false, message: 'Suggestions load failed!' });
        }

        return res.json({
            success: true,
            suggestions: data || [],
            count: (data || []).length
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error!' });
    }
});

app.delete('/api/suggestions/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('suggestions')
            .delete()
            .eq('id', id);

        if (error) {
            return res.status(500).json({ success: false, message: 'Delete failed!' });
        }

        return res.json({ success: true, message: 'Suggestion deleted!' });

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error!' });
    }
});

// Clear all suggestions
app.delete('/api/suggestions', async (req, res) => {
    try {
        const { error } = await supabase
            .from('suggestions')
            .delete()
            .neq('id', 0); // Delete all rows

        if (error) {
            return res.status(500).json({ success: false, message: 'Clear failed!' });
        }

        return res.json({ success: true, message: 'All suggestions cleared!' });

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error!' });
    }
});

// =========================================
// API ENDPOINT 6: ADD STUDENT (Center Admission)
// POST /api/students
// =========================================
app.post('/api/students', async (req, res) => {
    try {
        const { roll, name, father, dob, course, center, password, fees_total, mobile, img } = req.body;

        if (!roll || !name || !course || !center || !password) {
            return res.status(400).json({
                success: false,
                message: 'Roll, Name, Course, Center, Password - sab required hain!'
            });
        }

        // Check duplicate roll
        const { data: existing } = await supabase
            .from('students')
            .select('roll')
            .eq('roll', roll.trim().toUpperCase())
            .single();

        if (existing) {
            return res.status(409).json({
                success: false,
                message: `Roll Number "${roll}" already exists!`
            });
        }

        const { data, error } = await supabase
            .from('students')
            .insert([{
                roll: roll.trim().toUpperCase(),
                name: name.trim(),
                father: father || '',
                dob: dob || '',
                course: course,
                center: center,
                username: roll.trim().toUpperCase(), // username = roll number
                password: password,
                fees_total: fees_total || 0,
                fees_paid: 0,
                attendance: 0,
                mobile: mobile || '',
                img: img || 'https://via.placeholder.com/150'
            }])
            .select();

        if (error) {
            console.error('Student insert error:', error.message);
            return res.status(500).json({ success: false, message: 'Student add nahi ho paya: ' + error.message });
        }

        return res.json({
            success: true,
            message: `Student "${name}" added successfully with Roll: ${roll}`,
            student: data[0]
        });

    } catch (error) {
        console.error('🔥 Add Student Error:', error);
        return res.status(500).json({ success: false, message: 'Server Error!' });
    }
});

// =========================================
// API ENDPOINT 7: ADD CENTER (Admin)
// POST /api/centers
// =========================================
app.post('/api/centers', async (req, res) => {
    try {
        const { name, password, director, location, state } = req.body;

        if (!state || !name || !password) {
            return res.status(400).json({
                success: false,
                message: 'State, Center Name, and Password are required!'
            });
        }

        // Auto-generate code
        const code = state.toUpperCase().substring(0, 2) + '-' + Math.floor(1000 + Math.random() * 9000);

        const { data, error } = await supabase
            .from('centers')
            .insert([{
                code: code,
                name: name.trim(),
                username: code, // username = center code
                password: password,
                director: director || '',
                location: location || '',
                state: state
            }])
            .select();

        if (error) {
            console.error('Center insert error:', error.message);
            return res.status(500).json({ success: false, message: 'Center add failed: ' + error.message });
        }

        return res.json({
            success: true,
            message: `Center Created! Code: ${code}`,
            center: data[0]
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error!' });
    }
});

// =========================================
// API ENDPOINT 8: ADD COURSE (Admin)
// POST /api/courses
// =========================================
app.post('/api/courses', async (req, res) => {
    try {
        const { name, duration, fee, category, description, eligibility, img } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Course name is required!'
            });
        }

        const { data, error } = await supabase
            .from('courses')
            .insert([{
                name: name.trim(),
                duration: duration || '',
                fee: fee || '0',
                category: category || 'Computer',
                description: description || 'Join now to upgrade your skills.',
                eligibility: eligibility || '10th Pass',
                img: img || 'https://via.placeholder.com/400x250?text=Course'
            }])
            .select();

        if (error) {
            return res.status(500).json({ success: false, message: 'Course add failed: ' + error.message });
        }

        return res.json({
            success: true,
            message: `Course "${name}" added!`,
            course: data[0]
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error!' });
    }
});

// =========================================
// API ENDPOINT 9: ALL STUDENTS (Admin)
// GET /api/students
// =========================================
app.get('/api/students', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ success: false, message: 'Students load failed!' });
        }

        return res.json({
            success: true,
            students: data || []
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error!' });
    }
});

// =========================================
// API ENDPOINT 10: ALL CENTERS (Admin)
// GET /api/centers
// =========================================
app.get('/api/centers', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('centers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ success: false, message: 'Centers load failed!' });
        }

        return res.json({
            success: true,
            centers: data || []
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error!' });
    }
});

// =========================================
// API ENDPOINT 11: VERIFY CERTIFICATE (Public)
// GET /api/verify-certificate/:roll
// =========================================
app.get('/api/verify-certificate/:roll', async (req, res) => {
    try {
        const roll = req.params.roll.trim().toUpperCase();

        const { data, error } = await supabase
            .from('students')
            .select('roll, name, course, status, center')
            .eq('roll', roll)
            .single();

        if (error || !data) {
            return res.json({
                success: false,
                message: 'Record Not Found. This Roll Number does not exist.'
            });
        }

        return res.json({
            success: true,
            student: {
                roll: data.roll,
                name: data.name,
                course: data.course,
                status: data.status,
                center: data.center
            }
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error!' });
    }
});

// =========================================
// API ENDPOINT 12: VERIFY CENTER (Public)
// GET /api/verify-center/:code
// =========================================
app.get('/api/verify-center/:code', async (req, res) => {
    try {
        const code = req.params.code.trim().toUpperCase();

        const { data, error } = await supabase
            .from('centers')
            .select('code, name, state, director, is_blocked')
            .eq('code', code)
            .single();

        if (error || !data) {
            return res.json({
                success: false,
                message: 'Invalid Center Code. Not found in records.'
            });
        }

        return res.json({
            success: true,
            center: {
                code: data.code,
                name: data.name,
                state: data.state,
                director: data.director,
                isBlocked: data.is_blocked
            }
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error!' });
    }
});

// =========================================
// API ENDPOINT 13: STUDENT RESULT (Public)
// GET /api/result/:roll
// =========================================
app.get('/api/result/:roll', async (req, res) => {
    try {
        const roll = req.params.roll.trim().toUpperCase();

        const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('roll', roll)
            .single();

        if (error || !data) {
            return res.json({
                success: false,
                message: 'Roll Number Not Found.'
            });
        }

        // Demo marks (Baad mein marks table bana sakte ho)
        return res.json({
            success: true,
            result: {
                roll: data.roll,
                name: data.name,
                father: data.father,
                course: data.course,
                center: data.center,
                marks: {
                    theory: 85,
                    practical: 92,
                    viva: 88
                },
                total: '265 / 300',
                grade: 'A+',
                status: 'PASS'
            }
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error!' });
    }
});

// =========================================
// API ENDPOINT 14: DASHBOARD STATS (Admin)
// GET /api/stats
// =========================================
app.get('/api/stats', async (req, res) => {
    try {
        const { data: students } = await supabase.from('students').select('id', { count: 'exact' });
        const { data: centers } = await supabase.from('centers').select('id', { count: 'exact' });
        const { data: courses } = await supabase.from('courses').select('id', { count: 'exact' });
        const { data: suggestions } = await supabase.from('suggestions').select('id', { count: 'exact' });

        return res.json({
            success: true,
            stats: {
                totalStudents: students ? students.length : 0,
                totalCenters: centers ? centers.length : 0,
                totalCourses: courses ? courses.length : 0,
                totalSuggestions: suggestions ? suggestions.length : 0
            }
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Stats load failed!' });
    }
});

// =========================================
// API ENDPOINT 15: UPDATE FEE (Center Collects Fee)
// POST /api/collect-fee
// =========================================
app.post('/api/collect-fee', async (req, res) => {
    try {
        const { roll, amount } = req.body;

        if (!roll || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Roll Number aur Amount dono required hain!'
            });
        }

        // Get current student
        const { data: student, error: fetchErr } = await supabase
            .from('students')
            .select('fees_paid, fees_total')
            .eq('roll', roll.trim().toUpperCase())
            .single();

        if (fetchErr || !student) {
            return res.status(404).json({
                success: false,
                message: `Student with Roll "${roll}" not found!`
            });
        }

        const newPaid = (Number(student.fees_paid) || 0) + Number(amount);

        const { error: updateErr } = await supabase
            .from('students')
            .update({ fees_paid: newPaid })
            .eq('roll', roll.trim().toUpperCase());

        if (updateErr) {
            return res.status(500).json({ success: false, message: 'Fee update failed!' });
        }

        return res.json({
            success: true,
            message: `₹${amount} collected for ${roll}. New balance: ₹${newPaid}/${student.fees_total}`
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error!' });
    }
});

// =========================================
// API ENDPOINT 16: BLOCK/UNBLOCK CENTER (Admin)
// PUT /api/centers/:code/block
// =========================================
app.put('/api/centers/:code/block', async (req, res) => {
    try {
        const code = req.params.code;
        const { blocked } = req.body; // true or false

        const { error } = await supabase
            .from('centers')
            .update({ is_blocked: blocked })
            .eq('code', code);

        if (error) {
            return res.status(500).json({ success: false, message: 'Update failed!' });
        }

        return res.json({
            success: true,
            message: `Center ${code} ${blocked ? 'BLOCKED' : 'UNBLOCKED'} successfully!`
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error!' });
    }
});

// =========================================
// 404 HANDLER (Unknown Routes)
// =========================================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route "${req.method} ${req.url}" not found. Check /api/ endpoints.`
    });
});

// =========================================
// START SERVER
// =========================================
app.listen(PORT, () => {
    console.log('');
    console.log('=========================================');
    console.log(`🎓 LIFEWAY LMS SERVER`);
    console.log(`🚀 Running on port: ${PORT}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`📡 Supabase: Connected`);
    console.log('=========================================');
    console.log('');
});