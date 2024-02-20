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
      full_name: DataTypes.STRING,
      DOB: DataTypes.DATE
    }, {
      // Insert additional settings here.
    });

    User.associate = (models) => {
      User.hasMany(models.CarPark, { foreignKey: 'user_id', as: 'carParks' });
      User.hasMany(models.CarParkLog, { foreignKey: 'user_id', as: 'logs' });
  };

    return User;
  };
  