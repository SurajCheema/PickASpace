'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Users', [{
      car_registration: 'ABC123',
      email: 'user@example.com',
      // Hardcoded for testing purposes, will be hashed in the real application.
      password: 'password', 
      full_name: 'John Doe',
      // January 1, 1990
      DOB: new Date(1990, 0, 1), 
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
