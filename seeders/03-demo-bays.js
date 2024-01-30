'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Bays', [{
      carpark_id: 1, 
      bay_number: 1,
      taken: false
    }, {
      carpark_id: 1,
      bay_number: 2,
      taken: false
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Bays', null, {});
  }
};
