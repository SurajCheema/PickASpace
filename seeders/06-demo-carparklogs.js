'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    const hourlyRate = 10; // Hourly rate
    const durationHours = 2; // Duration in hours
    const cost = hourlyRate * durationHours; // Calculate total cost based on duration and hourly rate

    const now = new Date(); // Current time for reference

    await queryInterface.bulkInsert('CarParkLogs', [
      {
        carpark_id: 1,
        user_id: 1,
        bay_id: 1,
        payment_id: 1, // Corresponds to the first payment
        startTime: new Date(now.getTime() - (durationHours * 60 * 60 * 1000)), // Start 2 hours ago
        endTime: new Date(now.getTime() - 30 * 60 * 1000), // Ended 30 minutes ago
        cost: cost,
        status: 'completed', // Mark this log as completed
        createdAt: now,
        updatedAt: now
      },
      {
        carpark_id: 1,
        user_id: 1,
        bay_id: 1,
        payment_id: 2, // Corresponds to the second payment
        startTime: now,
        endTime: new Date(now.getTime() + (durationHours * 60 * 60 * 1000)), // Ends in 2 hours
        cost: cost,
        status: 'reserved', // Current reservation
        createdAt: now,
        updatedAt: now
      },
      {
        carpark_id: 1,
        user_id: 1,
        bay_id: 1,
        payment_id: 3, // Corresponds to the third payment
        startTime: new Date(now.getTime() + (24 * 60 * 60 * 1000)), // Starts in 24 hours
        endTime: new Date(now.getTime() + (26 * 60 * 60 * 1000)), // Ends in 26 hours
        cost: cost,
        status: 'reserved', // Future reservation
        createdAt: now,
        updatedAt: now
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('CarParkLogs', null, {});
  }
};