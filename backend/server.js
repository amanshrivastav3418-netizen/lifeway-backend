const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Configuration - Accept Hostinger frontend domains
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = (process.env.FRONTEND_URLS || 'http://localhost:3000').split(',');
    if (!origin || allowedOrigins.some(allowed => {
      const pattern = new RegExp(allowed.replace(/\./g, '\\.').replace(/\*/g, '.*'));
      return pattern.test(origin);
    })) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400
};

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Static files
app.use('/uploads', express.static('uploads'));

// Database
const pool = require('./config/database');
const { initializeDatabase } = require('./models/database');

// Initialize database on startup
initializeDatabase().then(() => {
  console.log('');
}).catch(err => {
  console.error('Failed to initialize database:', err.message);
});

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const studentRoutes = require('./routes/students');
const courseRoutes = require('./routes/courses');
const enrollmentRoutes = require('./routes/enrollments');
const centerRoutes = require('./routes/centers');
const staffRoutes = require('./routes/staff');
const dashboardRoutes = require('./routes/dashboard');
const documentRoutes = require('./routes/documents');

// API v1 routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/centers', centerRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/documents', documentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running', 
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Lifeway Computers Backend API',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/api/health'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found', path: req.path });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ 
    message, 
    error: process.env.NODE_ENV === 'development' ? err : {},
    timestamp: new Date()
  });
});

// Graceful shutdown handler
const server = app.listen(PORT, () => {
  console.log(`\n📚 Lifeway Backend Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`CORS enabled for: ${process.env.FRONTEND_URLS || 'http://localhost:3000'}\n`);
  console.log(`Connected to database: ${process.env.DB_HOST}\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    const pool = require('./config/database');
    pool.end(() => {
      console.log('Database connection pool closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    const pool = require('./config/database');
    pool.end(() => {
      console.log('Database connection pool closed');
      process.exit(0);
    });
  });
});

module.exports = app;
