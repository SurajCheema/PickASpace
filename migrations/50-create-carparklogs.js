'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CarParkLogs', {
      log_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      carpark_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'CarParks',
          key: 'carpark_id'
        },
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'user_id'
        },
        allowNull: false
      },
      bay_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Bays',
          key: 'bay_id'
        },
        allowNull: false
      },
      payment_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Payments',
          key: 'payment_id'
        },
        allowNull: true
      },
      startTime: {
        type: Sequelize.DATE,
        allowNull: false
      },
      endTime: {
        type: Sequelize.DATE,
        allowNull: false
      },
      cost: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'reserved',
        validate: {
          isIn: [['reserved', 'active', 'cancelled', 'completed', 'refunded']]
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      cancelledAt: {
        type: Sequelize.DATE,
        allowNull: true // This field is null until the booking is cancelled
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('CarParkLogs');
  }
};