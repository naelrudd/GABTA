'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add nip column to users table
    await queryInterface.addColumn('users', 'nip', {
      type: Sequelize.STRING(20),
      allowNull: true,
      unique: true,
      after: 'nim'
    });

    // Add email verification columns
    await queryInterface.addColumn('users', 'is_verified', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      after: 'roleId'
    });

    await queryInterface.addColumn('users', 'verification_token', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'is_verified'
    });

    await queryInterface.addColumn('users', 'verification_expires', {
      type: Sequelize.DATE,
      allowNull: true,
      after: 'verification_token'
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove columns
    await queryInterface.removeColumn('users', 'nip');
    await queryInterface.removeColumn('users', 'is_verified');
    await queryInterface.removeColumn('users', 'verification_token');
    await queryInterface.removeColumn('users', 'verification_expires');
  }
};
