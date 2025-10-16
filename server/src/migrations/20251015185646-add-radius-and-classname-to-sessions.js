'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('sessions', 'radius_meters', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 50,
      comment: 'Radius attendance area in meters'
    });

    await queryInterface.addColumn('sessions', 'class_name', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Class/Subject name for organizing sessions'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('sessions', 'radius_meters');
    await queryInterface.removeColumn('sessions', 'class_name');
  }
};
