'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('CarParkLogs', [
      {
        carpark_id: 1,
        user_id: 1,
        bay_id: 1,
        payment_id: 1, 
        startTime: new Date(),
        endTime: new Date(new Date().getTime() + (2*60*60*1000)), // 2 hours later
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('CarParkLogs', null, {});
  }
};
