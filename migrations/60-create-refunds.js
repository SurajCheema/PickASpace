'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Refunds', {
      refund_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      payment_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Payments', 
          key: 'payment_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      stripeRefundId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      receiptUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'requested'
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      log_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'CarParkLogs', 
          key: 'log_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      processedAt: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Refunds');
  }
};
