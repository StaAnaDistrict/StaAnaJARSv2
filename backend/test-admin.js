const { pool } = require('./db');

async function testAdminUser() {
  try {
    console.log('🔍 Testing admin user...');
    
    // Check if users table exists and has admin user
    const [users] = await pool.execute('SELECT * FROM users WHERE username = ?', ['JARS_Admin']);
    
    if (users.length === 0) {
      console.log('❌ Admin user not found. Creating default admin user...');
      
      // Create the admin user
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('StaAnaJars2025', 12);
      
      await pool.execute(
        'INSERT INTO users (username, password_hash, email, role) VALUES (?, ?, ?, ?)',
        ['JARS_Admin', hashedPassword, 'admin@staana-jars.com', 'admin']
      );
      
      console.log('✅ Default admin user created successfully!');
    } else {
      console.log('✅ Admin user found:', {
        id: users[0].user_id,
        username: users[0].username,
        role: users[0].role,
        is_active: users[0].is_active
      });
    }
    
    // Test login
    const [adminUsers] = await pool.execute(
      'SELECT * FROM users WHERE username = ? AND is_active = TRUE',
      ['JARS_Admin']
    );
    
    if (adminUsers.length > 0) {
      const bcrypt = require('bcryptjs');
      const isValidPassword = await bcrypt.compare('StaAnaJars2025', adminUsers[0].password_hash);
      
      if (isValidPassword) {
        console.log('✅ Admin login test successful!');
      } else {
        console.log('❌ Admin password verification failed');
      }
    } else {
      console.log('❌ Admin user not found or inactive');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await pool.end();
  }
}

testAdminUser(); 