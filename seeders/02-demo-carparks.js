'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('CarParks', [{
      carpark_id: 1,
      location: '123 Main St',
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('CarParks', null, {});
  }
};
