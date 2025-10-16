'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get admin role ID
    const [adminRole] = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE name = 'admin' LIMIT 1;`
    );

    if (!adminRole || adminRole.length === 0) {
      throw new Error('Admin role not found. Run roles seeder first.');
    }

    const adminRoleId = adminRole[0].id;
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Remove existing admin (idempotent)
    await queryInterface.bulkDelete('users', { email: 'admin@gabta.com' }, {});

    return queryInterface.bulkInsert('users', [
      {
        id: uuidv4(),
        email: 'admin@gabta.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        roleId: adminRoleId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', { email: 'admin@gabta.com' }, {});
  }
};