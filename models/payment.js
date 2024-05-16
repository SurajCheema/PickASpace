'use strict';

module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    payment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    stripePaymentId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2)
    },
    paymentStatus: {
      type: DataTypes.STRING,
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'completed', 'failed', 'refunded']]
      }
    },
    receiptUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    date_paid: DataTypes.DATE,
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'user_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    platformFee: {
      type: DataTypes.DECIMAL(10, 2)
    },
    processingFee: {
      type: DataTypes.DECIMAL(10, 2)
    },
  });

  Payment.associate = (models) => {
    Payment.belongsTo(models.User, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE' });
    Payment.hasOne(models.Refund, { foreignKey: 'payment_id', as: 'refund', onDelete: 'CASCADE' });
    Payment.hasOne(models.CarParkLog, { foreignKey: 'payment_id', as: 'log', onDelete: 'CASCADE' });
  };

  return Payment;
};
