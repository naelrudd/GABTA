'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const roles = [
      {
        name: 'admin',
        permissions: JSON.stringify([
          'create_session',
          'update_session',
          'delete_session',
          'view_session',
          'view_statistics',
          'view_users',
          'update_users',
          'create_users',
          'delete_users',
          'manage_roles'
        ]),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'committee',
        permissions: JSON.stringify([
          'create_session',
          'update_session',
          'delete_session',
          'view_session',
          'view_statistics'
        ]),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'participant',
        permissions: JSON.stringify([
          'view_session',
          'submit_attendance'
        ]),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Insert only roles that don't already exist to avoid FK/delete issues
    const existing = await queryInterface.sequelize.query(
      `SELECT name FROM roles WHERE name IN (${roles.map(r => `'${r.name}'`).join(',')})`);

    const existingNames = (existing[0] || []).map(r => r.name);
    const toInsert = roles.filter(r => !existingNames.includes(r.name));

    if (toInsert.length === 0) {
      return Promise.resolve();
    }

    return queryInterface.bulkInsert('roles', toInsert);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('roles', null, {});
  }
};