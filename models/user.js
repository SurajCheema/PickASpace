'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    car_registration: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    DOB: DataTypes.DATE,
    phone: DataTypes.STRING,
    address: DataTypes.STRING,
    role: {
      type: DataTypes.STRING,
      defaultValue: 'user'  // Values: 'user', 'admin', 'warden'
    },
    reset_password_token: DataTypes.STRING,
    reset_password_expires: DataTypes.DATE,
    blueBadge: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    stripe_account_id: {
      type: DataTypes.STRING,
      allowNull: true  // It's possible not every user will have a Stripe account
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    }
  }, {
    // Insert additional settings here.
    paranoid: true
  });

  User.associate = (models) => {
    User.hasMany(models.CarPark, { foreignKey: 'user_id', as: 'carParks', onDelete: 'CASCADE' });
    User.hasMany(models.CarParkLog, { foreignKey: 'user_id', as: 'logs', onDelete: 'CASCADE' });
    User.hasMany(models.Payment, { foreignKey: 'userId', as: 'payments', onDelete: 'CASCADE' });
    User.hasMany(models.Refund, { foreignKey: 'createdBy', as: 'createdRefunds', onDelete: 'CASCADE' });
    User.hasMany(models.Refund, { foreignKey: 'updatedBy', as: 'updatedRefunds', onDelete: 'CASCADE' });
  };

  return User;
};
