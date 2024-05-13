'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      user_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      car_registration: {
        type: Sequelize.STRING,
        allowNull: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      DOB: {
        type: Sequelize.DATE,
        allowNull: false
      },
      phone: { 
        type: Sequelize.STRING,
        allowNull: true 
      },
      address: { 
        type: Sequelize.STRING,
        allowNull: true 
      },
      role: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'user' // Default is 'user', can also be 'admin' or 'warden'
      },
      reset_password_token: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      reset_password_expires: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      blueBadge: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      stripe_account_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      },
      stripe_onboarding_complete: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};
