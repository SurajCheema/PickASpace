'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('CarParkLogs', {
      log_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      carpark_id: {
        type: Sequelize.INTEGER,
        references: { model: 'CarParks', key: 'carpark_id' }
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'user_id' }
      },
      date: {
        type: Sequelize.DATE
      },
      duration: {
        type: Sequelize.INTEGER
      },
      bay_id: {
        type: Sequelize.INTEGER,
        references: { model: 'Bays', key: 'bay_id' }
      },
      payment_id: {
        type: Sequelize.INTEGER,
        references: { model: 'Payments', key: 'payment_id' }
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('CarParkLogs');
  }
};
