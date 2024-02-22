'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Bays', [
      {
        carpark_id: 1, // Assuming the first car park
        bay_number: 1,
        vehicleSize: 'Medium',
        hasEVCharging: false,
        disabled: false,
        description: 'Bay 1, Medium size, No EV Charging, No disabled access',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        carpark_id: 1,
        bay_number: 2,
        vehicleSize: 'Large',
        hasEVCharging: true,
        disabled: true,
        description: 'Bay 2, Large size, With EV Charging, Disabled access',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        carpark_id: 1,
        bay_number: 3,
        vehicleSize: 'Small',
        hasEVCharging: false,
        disabled: false,
        description: 'Bay 3, Small size, No EV Charging, No disabled access',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        carpark_id: 1,
        bay_number: 4,
        vehicleSize: 'Medium',
        hasEVCharging: true,
        disabled: false,
        description: 'Bay 4, Medium size, With EV Charging, No disabled access',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Bays', null, {});
  }
};
