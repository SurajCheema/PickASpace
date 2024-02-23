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
      },
      // Second example carpark
      {
        addressLine1: '456 Side Rd',
        addressLine2: 'Block 2',
        city: 'New City',
        postcode: '67890',
        openTime: '09:00',
        closeTime: '17:00',
        accessInstructions: 'Call upon arrival',
        pricing: JSON.stringify({
          hourly: 3.0,
          daily: 20.0,
          weekly: 110.0,
          monthly: 400.0
        }),
        user_id: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Third example carpark
      {
        addressLine1: '789 Circle Ave',
        addressLine2: '',
        city: 'Oldtown',
        postcode: '54321',
        openTime: '07:00',
        closeTime: '19:00',
        accessInstructions: 'Use the side gate',
        pricing: JSON.stringify({
          hourly: 3.5,
          daily: 22.0,
          weekly: 120.0,
          monthly: 450.0
        }),
        user_id: 1, // Adjust if needed
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('CarParks', null, {});
  }
};
