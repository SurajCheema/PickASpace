'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Payments', {
      payment_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      stripePaymentId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      amount: {
        type: Sequelize.DECIMAL
      },
      paymentStatus: {
        type: Sequelize.STRING,
        defaultValue: 'pending' // Example values: pending, completed, failed, refunded
      },
      receiptUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      date_paid: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Payments');
  }
};
