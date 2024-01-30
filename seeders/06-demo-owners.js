'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Owners', [{
      carpark_id: 1,
      email: 'owner@example.com',
      // Hardcoded for testing purposes, will be hashed in the real application.
      password: 'password',
      full_name: 'Alex Smith'
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Owners', null, {});
  }
};
