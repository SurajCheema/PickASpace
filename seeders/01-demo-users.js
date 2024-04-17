'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  async up (queryInterface, Sequelize) {
    const saltRounds = 10; // Same as register process
    const users = [
      {
        email: 'user@test.com',
        password: 'test', // Plain password will be hashed below
        first_name: 'John',
        last_name: 'Doe',
        DOB: new Date('1990-01-01'),
        car_registration: 'ABC123',
        phone: '+44123456789',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Hash password 
    for (let user of users) {
      user.password = await bcrypt.hash(user.password, saltRounds);
    }

    await queryInterface.bulkInsert('Users', users, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};