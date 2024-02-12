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

    // If you define associations here, make sure all related models are already defined.
    User.associate = (models) => {
      User.hasMany(models.CarPark, { foreignKey: 'user_id' });
    };
    return User;
  };
  