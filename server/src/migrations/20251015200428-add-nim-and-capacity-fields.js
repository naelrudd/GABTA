'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add nim column to users table
    await queryInterface.addColumn('users', 'nim', {
      type: Sequelize.STRING(20),
      allowNull: true,
      unique: true,
      after: 'lastName'
    });

    // Add max_capacity column to sessions table
    await queryInterface.addColumn('sessions', 'max_capacity', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
      after: 'kode_kelas'
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove nim column from users table
    await queryInterface.removeColumn('users', 'nim');

    // Remove max_capacity column from sessions table
    await queryInterface.removeColumn('sessions', 'max_capacity');
  }
};
