'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Users', [
      {
        email: 'user@example.com',
        password: 'hashedpassword', // Will hash in production
        full_name: 'John Doe',
        DOB: new Date('1990-01-01'),
        car_registration: 'ABC123',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};