'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('CarParks', [
      {
        addressLine1: '123 Main St',
        addressLine2: 'Ave Park',
        city: 'Anytown',
        postcode: '12345',
        openTime: '08:00',
        closeTime: '18:00',
        accessInstructions: 'Press buzzer',
        pricing: JSON.stringify({
          hourly: 2.5,
          daily: 18.0,
          weekly: 100.0,
          monthly: 350.0
        }),
        user_id: 1, // Assuming the first user from the previous seeder
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('CarParks', null, {});
  }
};
