const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

const dbConfig = {
  host: process.env.DB_HOST || 'jx73k.h.filess.io',
  user: process.env.DB_USER || 'staaajarsdatabase_noonenough',
  password: process.env.DB_PASSWORD || '1ef11e875a83c6abe3196f4a6934346c4b9ff0ee',
  database: process.env.DB_NAME || 'staaajarsdatabase_noonenough',
  port: process.env.DB_PORT || 3307,
  connectionLimit: 1
};

async function testDatabase() {
  let connection;
  
  try {
    console.log('🔗 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // Check if recognitions table exists
    console.log('🔍 Checking if recognitions table exists...');
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'recognitions'"
    );
    
    if (tables.length === 0) {
      console.log('❌ Recognitions table does not exist!');
      console.log('📋 Available tables:');
      const [allTables] = await connection.execute('SHOW TABLES');
      allTables.forEach(table => {
        console.log(`  - ${Object.values(table)[0]}`);
      });
    } else {
      console.log('✅ Recognitions table exists');
      
      // Check table structure
      console.log('🔍 Checking table structure...');
      const [columns] = await connection.execute('DESCRIBE recognitions');
      console.log('📋 Recognitions table columns:');
      columns.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
      
      // Check if table has data
      const [rows] = await connection.execute('SELECT COUNT(*) as count FROM recognitions');
      console.log(`📊 Recognitions table has ${rows[0].count} records`);
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('Error details:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔗 Connection closed');
    }
  }
}

testDatabase(); 