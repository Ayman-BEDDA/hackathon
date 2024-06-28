'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await Promise.all([
      queryInterface.addColumn('users', 'role', {
        type: Sequelize.STRING(64),
        allowNull: true,
      }),
    ]);
  },

  async down (queryInterface, Sequelize) {
    await Promise.all([
      queryInterface.removeColumn('users', 'name'),
    ]);
  }
};
