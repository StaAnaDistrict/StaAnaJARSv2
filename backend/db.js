const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'config.env') });

// Database configuration - use single connection to avoid limits
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  // Single connection to avoid hitting limits
  connectionLimit: 1,
  waitForConnections: true,
  queueLimit: 0
};

console.log('📊 Database config:', {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database,
  port: dbConfig.port
});

// Create connection pool with minimal settings
const pool = mysql.createPool(dbConfig);

// Connection wrapper to ensure proper cleanup
let connectionErrors = 0;
const MAX_CONNECTION_ERRORS = 3;

async function withConnection(callback) {
  if (connectionErrors >= MAX_CONNECTION_ERRORS) {
    throw new Error('Too many connection errors, please wait a moment');
  }

  let connection;
  try {
    connection = await pool.getConnection();
    console.log(`🔗 Connection acquired. Active: ${pool.pool._allConnections.length}`);
    
    const result = await callback(connection);
    return result;
  } catch (error) {
    connectionErrors++;
    console.error('❌ Database operation failed:', error.message);
    throw error;
  } finally {
    if (connection) {
      connection.release();
      console.log(`🔗 Connection released. Active: ${pool.pool._allConnections.length - 1}`);
    }
  }
}

// Test database connection
async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    await withConnection(async (connection) => {
      await connection.execute('SELECT 1');
    });
    console.log('✅ Database connection successful!');
    connectionErrors = 0; // Reset error counter on success
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('Error details:', error);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down database pool...');
  await pool.end();
  console.log('✅ Database pool closed');
  process.exit(0);
});

module.exports = { pool, withConnection, testConnection }; 