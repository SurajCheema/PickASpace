'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Bays', {
      bay_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      carpark_id: {
        type: Sequelize.INTEGER,
        references: { model: 'CarParks', key: 'carpark_id' }
      },
      bay_number: {
        type: Sequelize.INTEGER
      },
      taken: {
        type: Sequelize.BOOLEAN
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Bays');
  }
};
