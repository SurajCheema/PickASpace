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
      allowNull: false,
      validate: {
        isPositive(value) {
          if (value <= 0) {
            throw new Error("Refund amount must be greater than zero.");
          }
        }
      }
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'requested',
      validate: {
        isIn: [['requested', 'approved', 'denied']]
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
        model: 'CarParkLogs', 
        key: 'log_id'
      }
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'user_id'
      }
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'user_id'
      }
    },
    decision: { // Decision made by admin on refund request
      type: DataTypes.TEXT,
      allowNull: true
    },
  });

  Refund.associate = function (models) {
    Refund.belongsTo(models.CarParkLog, { foreignKey: 'log_id', as: 'carParkLog' });
    Refund.belongsTo(models.Payment, { foreignKey: 'payment_id', as: 'payment' });
    Refund.belongsTo(models.User, { foreignKey: 'createdBy', as: 'creator' });
    Refund.belongsTo(models.User, { foreignKey: 'updatedBy', as: 'modifier' });
  };

  return Refund;
};