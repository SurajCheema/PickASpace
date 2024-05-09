'use strict';
const faker = require('faker'); 

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('CarParks', [
      {
        addressLine1: '123 Main St',
        addressLine2: 'Ave Park',
        city: 'London',
        postcode: 'SW1A 1AA', // Central London postcode
        openTime: '08:00',
        closeTime: '18:00',
        accessInstructions: 'Press buzzer',
        pricing: JSON.stringify({
          hourly: 2.5,
          daily: 18.0,
          weekly: 100.0,
          monthly: 350.0
        }),
        latitude: faker.datatype.number({ min: 51.5070, max: 51.5100, precision: 0.0001 }),
        longitude: faker.datatype.number({ min: -0.1284, max: -0.1240, precision: 0.0001 }),
        user_id: 1, // Test user owns carpark
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        addressLine1: '456 Side Rd',
        addressLine2: 'Block 2',
        city: 'London',
        postcode: 'E1 6AN', // East London postcode
        openTime: '09:00',
        closeTime: '17:00',
        accessInstructions: 'Call upon arrival',
        pricing: JSON.stringify({
          hourly: 3.0,
          daily: 20.0,
          weekly: 110.0,
          monthly: 400.0
        }),
        latitude: faker.datatype.number({ min: 51.5150, max: 51.5200, precision: 0.0001 }),
        longitude: faker.datatype.number({ min: -0.0700, max: -0.0600, precision: 0.0001 }),
        user_id: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        addressLine1: '789 Circle Ave',
        addressLine2: '',
        city: 'London',
        postcode: 'N1 0QH', // North London postcode
        openTime: '07:00',
        closeTime: '19:00',
        accessInstructions: 'Use the side gate',
        pricing: JSON.stringify({
          hourly: 3.5,
          daily: 22.0,
          weekly: 120.0,
          monthly: 450.0
        }),
        latitude: faker.datatype.number({ min: 51.5300, max: 51.5400, precision: 0.0001 }),
        longitude: faker.datatype.number({ min: -0.1100, max: -0.1000, precision: 0.0001 }),
        user_id: 1, 
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('CarParks', null, {});
  }
};
