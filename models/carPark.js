'use strict';

module.exports = (sequelize, DataTypes) => {
  const CarPark = sequelize.define('CarPark', {
    carpark_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    openTime: {
      type: DataTypes.DATE,
    },
    closeTime: {
      type: DataTypes.DATE,
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
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },
  });

  // Define associations
  CarPark.associate = (models) => {
    CarPark.belongsTo(models.User, { foreignKey: 'user_id', as: 'User', onDelete: 'CASCADE' });
    CarPark.hasMany(models.Bay, { foreignKey: 'carpark_id', as: 'bays', onDelete: 'CASCADE' });
    CarPark.hasMany(models.CarParkLog, { foreignKey: 'carpark_id', as: 'logs', onDelete: 'CASCADE' });
  };

  return CarPark;
};
