const mysql = require('mysql2/promise');
require('dotenv').config();

// Database connection pool configuration
// Optimized for Render.com + Hostinger MySQL connectivity
const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'lifeway_computers',
  port: parseInt(process.env.DB_PORT) || 3306,
  
  // Connection Pool Settings
  waitForConnections: process.env.DB_WAIT_FOR_CONNECTIONS === 'true',
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: parseInt(process.env.DB_QUEUE_LIMIT) || 0,
  
  // Keep-Alive Configuration (Critical for Render Free Tier)
  enableKeepAlive: process.env.DB_ENABLE_KEEP_ALIVE === 'true',
  keepAliveInitialDelayMs: parseInt(process.env.DB_KEEP_ALIVE_INITIAL_DELAY_MS) || 0,
  
  // Connection timeout (30 seconds)
  connectionTimeout: 30000,
  
  // Timezone
  timezone: '+00:00',
  
  // Support BIGINT64
  supportBigNumbers: true,
  bigNumberStrings: true,
};

const pool = mysql.createPool(poolConfig);

// Enhanced error handling for connection failures
let connectionAttempts = 0;
const maxRetries = 3;
const retryDelay = 5000; // 5 seconds

function testConnection() {
  return pool.getConnection()
    .then(connection => {
      connectionAttempts = 0; // Reset on successful connection
      console.log('✓ MySQL Database connected successfully');
      console.log(`  Host: ${poolConfig.host}`);
      console.log(`  Database: ${poolConfig.database}`);
      console.log(`  Pool Connections: ${poolConfig.connectionLimit}`);
      connection.release();
      return true;
    })
    .catch(err => {
      connectionAttempts++;
      console.error(`✗ MySQL connection attempt ${connectionAttempts}/${maxRetries} failed:`, err.message);
      
      if (connectionAttempts < maxRetries) {
        console.log(`  Retrying in ${retryDelay / 1000} seconds...`);
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(testConnection());
          }, retryDelay);
        });
      } else {
        console.error('✗ Failed to connect to MySQL after', maxRetries, 'attempts');
        
        // IMPORTANT: Hostinger firewall may block external connections
        console.error('\n⚠️  TROUBLESHOOTING TIPS:');
        console.error('  1. Enable Remote MySQL in Hostinger cPanel > Databases > Remote MySQL');
        console.error('  2. Add Render.com IP to whitelist or allow all (%)');
        console.error('  3. Verify DB_HOST, DB_USER, DB_PASSWORD in .env file');
        console.error('  4. Check Hostinger firewall settings');
        console.error('  5. Verify database exists in Hostinger cPanel\n');
        
        if (process.env.NODE_ENV === 'production') {
          process.exit(1);
        }
        return false;
      }
    });
}

// Test connection on startup (with retries) - Only in production
if (process.env.NODE_ENV === 'production') {
  testConnection();
} else {
  console.log('Development mode: Skipping database connection test on startup');
  console.log('Database will be tested when first query is made');
}

// Handle pool errors
pool.on('error', (err) => {
  console.error('Database pool error:', err.message);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('Database connection was closed.');
  }
  if (err.code === 'PROTOCOL_ERROR') {
    console.error('Database protocol error.');
  }
  if (err.code === 'ER_CON_COUNT_ERROR') {
    console.error('Database has too many connections.');
  }
  if (err.code === 'ER_AUTHENTICATION_PLUGIN_ERROR') {
    console.error('Database authentication plugin error.');
  }
  if (err.code === 'ECONNREFUSED') {
    console.error('Database connection was refused.');
  }
});

// Export pool and utility functions
module.exports = pool;

// Helper function to execute queries with error handling
module.exports.query = async (sql, values = []) => {
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.execute(sql, values);
    connection.release();
    return results;
  } catch (error) {
    console.error('Query execution error:', error.message);
    throw error;
  }
};

// Helper function to get a connection
module.exports.getConnection = async () => {
  try {
    return await pool.getConnection();
  } catch (error) {
    console.error('Failed to get database connection:', error.message);
    throw error;
  }
};
