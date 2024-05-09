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
        car_registration: 'AA19AAA', // DVLA TEST API Registration number
        phone: '+44123456789',
        role: 'user', // Normal user role
        createdAt: new Date(),
        updatedAt: new Date(),
        stripe_account_id: 'acct_1PEWPmEDBZAcK5pZ'
      },
      {
        email: 'admin@test.com',
        password: 'test', // Plain password will be hashed below
        first_name: 'Jane',
        last_name: 'Admin',
        DOB: new Date('1985-05-15'),
        car_registration: 'AA19EEE', // Admin might not need a car registration but given a test one for testing purposes. (DVLA TEST API Registration number).
        phone: '+44123456700',
        role: 'admin', // Admin role
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'surajcheema@outlook.com',
        password: 'test', // Plain password will be hashed below
        first_name: 'Suraj',
        last_name: 'C',
        DOB: new Date('1990-01-01'),
        car_registration: 'AA19PPP', // DVLA TEST API Registration number
        phone: '+44123456789',
        role: 'user', // Normal user role
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ];

    // Hash passwords
    for (let user of users) {
      user.password = await bcrypt.hash(user.password, saltRounds);
    }

    await queryInterface.bulkInsert('Users', users, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};