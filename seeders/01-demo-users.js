'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  async up (queryInterface, Sequelize) {
    const saltRounds = 10; // Same as register process
    const users = [
      {
        email: 'user@example.com',
        password: 'password', // Plain password will be hashed below
        full_name: 'John Doe',
        DOB: new Date('1990-01-01'),
        car_registration: 'ABC123',
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