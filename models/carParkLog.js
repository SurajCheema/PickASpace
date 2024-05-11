'use strict';

module.exports = (sequelize, DataTypes) => {
  const CarParkLog = sequelize.define('CarParkLog', {
    log_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    carpark_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'CarParks',
        key: 'carpark_id'
      }
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'user_id'
      }
    },
    bay_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Allow null values
      references: {
        model: 'Bays',
        key: 'bay_id'
      },
      onDelete: 'SET NULL' // Set the foreign key constraint to ON DELETE SET NULL
    },
    payment_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Payments',
        key: 'payment_id'
      }
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'reserved',
      validate: {
        isIn: [['reserved', 'active', 'cancelled', 'completed', 'refunded']]
      }
    },
    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true // This field is null until the booking is cancelled
    },
  });

  CarParkLog.associate = (models) => {
    CarParkLog.belongsTo(models.CarPark, { foreignKey: 'carpark_id', as: 'carPark', onDelete: 'CASCADE' });
    CarParkLog.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    CarParkLog.belongsTo(models.Bay, { foreignKey: 'bay_id', as: 'bay' });
    CarParkLog.belongsTo(models.Payment, { foreignKey: 'payment_id', as: 'payment', onDelete: 'CASCADE' });
  };

  return CarParkLog;
};