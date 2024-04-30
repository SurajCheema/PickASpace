'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('CarParks', {
      carpark_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      openTime: {
        type: Sequelize.TIME
      },
      closeTime: {
        type: Sequelize.TIME
      },
      accessInstructions: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      pricing: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {}
      },
      addressLine1: {
        type: Sequelize.STRING,
        allowNull: false
      },
      addressLine2: {
        type: Sequelize.STRING,
        allowNull: true
      },
      city: {
        type: Sequelize.STRING,
        allowNull: false
      },
      postcode: {
        type: Sequelize.STRING,
        allowNull: false
      },      
      user_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
  });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('CarParks');
  }
};
