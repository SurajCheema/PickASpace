'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Bays', {
      bay_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      carpark_id: {
        type: Sequelize.INTEGER,
        references: { model: 'CarParks', key: 'carpark_id' }
      },
      bay_number: {
        type: Sequelize.INTEGER
      },
      isAvailable: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      vehicleSize: {
        type: Sequelize.STRING
      },
      hasEVCharging: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      disabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Bays');
  }
};
