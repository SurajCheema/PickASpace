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
      allowNull: true,
      references: {
        model: 'Bays',
        key: 'bay_id'
      },
      onDelete: 'SET NULL' 
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
      allowNull: true
    },
  });

  CarParkLog.associate = (models) => {
    CarParkLog.belongsTo(models.CarPark, { foreignKey: 'carpark_id', as: 'carPark', onDelete: 'CASCADE' });
    CarParkLog.belongsTo(models.User, { foreignKey: 'user_id', as: 'user', onDelete: 'CASCADE' });
    CarParkLog.belongsTo(models.Bay, { foreignKey: 'bay_id', as: 'bay', onDelete: 'CASCADE' });
    CarParkLog.belongsTo(models.Payment, { foreignKey: 'payment_id', as: 'payment', onDelete: 'CASCADE' });
  };

  return CarParkLog;
};
