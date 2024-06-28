'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('reports', 'roomId', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'rooms',
        key: 'id'
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('reports', 'roomId');
  }
};
