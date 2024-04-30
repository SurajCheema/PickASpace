'use strict';

module.exports = (sequelize, DataTypes) => {
  const CarPark = sequelize.define('CarPark', {
    carpark_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    openTime: {
      type: DataTypes.TIME
    },
    closeTime: {
      type: DataTypes.TIME
    },
    accessInstructions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    pricing: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {}
    },
    addressLine1: {
      type: DataTypes.STRING,
      allowNull: false
    },
    addressLine2: {
      type: DataTypes.STRING,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    postcode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: { model: 'Users', key: 'user_id' }
    }
  });

  // Define associations
  CarPark.associate = (models) => {
    CarPark.belongsTo(models.User, { foreignKey: 'user_id' });
    CarPark.hasMany(models.Bay, { foreignKey: 'carpark_id', as: 'bays' });
    CarPark.hasMany(models.CarParkLog, { foreignKey: 'carpark_id', as: 'logs' });
  };

  return CarPark;
};
