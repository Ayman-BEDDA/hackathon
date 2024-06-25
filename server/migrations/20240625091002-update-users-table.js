'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await Promise.all([
      queryInterface.addColumn('users', 'name', {
        type: Sequelize.STRING(64),
        allowNull: false,
      }),
      queryInterface.addColumn('users', 'surname', {
        type: Sequelize.STRING(64),
        allowNull: false,
      }),
      queryInterface.addColumn('users', 'Birthdate', {
        type: Sequelize.DATE,
        allowNull: true,
      }),
,
      queryInterface.addColumn('users', 'token', {
        type: Sequelize.STRING(256),
        allowNull: true,
      })
    ]);
  },

  async down (queryInterface, Sequelize) {
    await Promise.all([
      queryInterface.removeColumn('users', 'name'),
      queryInterface.removeColumn('users', 'surname'),
      queryInterface.removeColumn('users', 'Birthdate'),
      queryInterface.removeColumn('users', 'token')
    ]);
  }
};
