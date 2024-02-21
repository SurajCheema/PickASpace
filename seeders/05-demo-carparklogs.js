'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    const hourlyRate = 10; // Hourly rate
    const durationHours = 2; // Duration in hours
    const cost = hourlyRate * durationHours; // Calculate total cost based on duration and hourly rate

    await queryInterface.bulkInsert('CarParkLogs', [
      {
        carpark_id: 1,
        user_id: 1,
        bay_id: 1,
        payment_id: 1, 
        startTime: new Date(),
        endTime: new Date(new Date().getTime() + (durationHours*60*60*1000)), // 2 hours later
        cost: cost,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('CarParkLogs', null, {});
  }
};