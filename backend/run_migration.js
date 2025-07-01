const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

const dbConfig = {
  host: process.env.DB_HOST || 'jx73k.h.filess.io',
  user: process.env.DB_USER || 'staaajarsdatabase_noonenough',
  password: process.env.DB_PASSWORD || '1ef11e875a83c6abe3196f4a6934346c4b9ff0ee',
  database: process.env.DB_NAME || 'staaajarsdatabase_noonenough',
  port: process.env.DB_PORT || 3307,
  connectionLimit: 1,
  acquireTimeout: 60000,
  timeout: 60000
};

async function runMigration() {
  let connection;
  
  try {
    console.log('🔗 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // Check if columns already exist
    console.log('🔍 Checking if columns already exist...');
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'researches' 
      AND COLUMN_NAME IN ('published_in', 'published_on')
    `, [dbConfig.database]);
    
    if (columns.length > 0) {
      console.log('⚠️  Columns already exist:', columns.map(c => c.COLUMN_NAME));
      return;
    }
    
    // Add the new columns
    console.log('📝 Adding published_in and published_on columns...');
    await connection.execute(`
      ALTER TABLE researches 
      ADD COLUMN published_in TEXT NULL COMMENT 'Auto-generated text: "Category Action Research. Completed in Month of Year."',
      ADD COLUMN published_on TEXT NULL COMMENT 'Auto-generated text: "Category Action Research Sta. Ana JARS Journal Issue X, Date"'
    `);
    console.log('✅ Columns added successfully');
    
    // Update existing records with auto-generated values
    console.log('🔄 Updating existing records...');
    await connection.execute(`
      UPDATE researches r
      JOIN action_research_types art ON r.action_research_type_id = art.type_id
      SET 
        r.published_in = CONCAT(art.type_name, ' Action Research. Completed in ', r.completion_month, ' of ', r.completion_year, '.'),
        r.published_on = CONCAT(art.type_name, ' Action Research Sta. Ana JARS Journal Issue ', r.journal_issue_number, ', ', DATE_FORMAT(r.online_publication_date, '%B %d, %Y'))
      WHERE r.published_in IS NULL OR r.published_on IS NULL
    `);
    console.log('✅ Existing records updated');
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔗 Database connection closed');
    }
  }
}

runMigration(); 