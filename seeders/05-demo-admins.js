'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Admins', [{
      email: 'admin@example.com',
      password: 'password',
      full_name: 'John Doe',
      DOB: new Date('1990-01-01'),
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Admins', null, {});
  }
};
