'use strict';

module.exports = (sequelize, DataTypes) => {
  const Refund = sequelize.define('Refund', {
    refund_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    payment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Payments',
        key: 'payment_id'
      }
    },
    stripeRefundId: {
      type: DataTypes.STRING
    },
    receiptUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'requested',
      validate: {
        isIn: [['requested', 'approved', 'processed', 'denied']]
      }
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true  // Optional field, can be null if no reason is provided
    },
    log_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'CarParkLog',
        key: 'log_id'
      }
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  });

  Refund.associate = function (models) {
    // Linking Refund to CarParkLog
    Refund.belongsTo(models.CarParkLog, { foreignKey: 'log_id', as: 'carParkLog' });
    // Linking Refund to Payment
    Refund.belongsTo(models.Payment, { foreignKey: 'payment_id', as: 'payment' });
  };

  return Refund;
};