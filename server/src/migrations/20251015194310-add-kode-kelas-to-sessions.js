'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('sessions', 'kode_kelas', {
      type: Sequelize.STRING(20),
      allowNull: true,
      comment: 'Kode kelas untuk identifikasi (e.g., IF101, MTK201)'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('sessions', 'kode_kelas');
  }
};
