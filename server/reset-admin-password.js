// Script untuk reset password admin
// Run: node server/reset-admin-password.js

const bcrypt = require('bcryptjs');
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Database connection
const sequelize = new Sequelize(
  process.env.DB_NAME || 'gabta_dev',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  }
);

async function resetAdminPassword() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Hash new password
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('🔐 New password hash:', hashedPassword);

    // Update admin password
    const [results] = await sequelize.query(`
      UPDATE users 
      SET password = :hashedPassword, "updatedAt" = NOW()
      WHERE email = 'admin@gabta.com'
      RETURNING id, email, "firstName", "lastName"
    `, {
      replacements: { hashedPassword }
    });

    if (results.length > 0) {
      console.log('✅ Admin password updated successfully!');
      console.log('👤 User:', results[0]);
      console.log('');
      console.log('🎯 Login credentials:');
      console.log('   Email: admin@gabta.com');
      console.log('   Password: admin123');
    } else {
      console.log('❌ Admin user not found!');
      console.log('');
      console.log('Creating admin user...');
      
      // Get admin role ID
      const [[role]] = await sequelize.query(`
        SELECT id FROM roles WHERE name = 'admin' LIMIT 1
      `);

      if (!role) {
        console.error('❌ Admin role not found! Run migrations and seeders first.');
        process.exit(1);
      }

      // Create admin user
      const { v4: uuidv4 } = require('uuid');
      const adminId = uuidv4();
      
      await sequelize.query(`
        INSERT INTO users (id, email, password, "firstName", "lastName", "roleId", "createdAt", "updatedAt")
        VALUES (:id, :email, :password, :firstName, :lastName, :roleId, NOW(), NOW())
      `, {
        replacements: {
          id: adminId,
          email: 'admin@gabta.com',
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          roleId: role.id
        }
      });

      console.log('✅ Admin user created successfully!');
      console.log('🎯 Login credentials:');
      console.log('   Email: admin@gabta.com');
      console.log('   Password: admin123');
    }

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetAdminPassword();
