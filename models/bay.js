'use strict';

module.exports = (sequelize, DataTypes) => {
  const Bay = sequelize.define('Bay', {
    bay_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    carpark_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'CarPark',
        key: 'carpark_id'
      }
    },
    bay_number: {
      type: DataTypes.INTEGER
    },
    vehicleSize: {
      type: DataTypes.STRING
    },
    hasEVCharging: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    disabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    }
  });

  Bay.associate = (models) => {
    Bay.belongsTo(models.CarPark, { foreignKey: 'carpark_id', as: 'carPark' });
    Bay.hasMany(models.CarParkLog, { foreignKey: 'bay_id', as: 'logs' });
  };

  return Bay;
};