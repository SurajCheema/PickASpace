'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('CarParks', {
      carpark_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      location: {
        type: Sequelize.STRING
      },
      openTime: {
        type: Sequelize.TIME
      },
      closeTime: {
        type: Sequelize.TIME
      },
      accessInstructions: {
        type: Sequelize.STRING,
        allowNull: true
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('CarParks');
  }
};
