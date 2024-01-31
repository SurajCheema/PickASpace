module.exports = (sequelize, DataTypes) => {
    const CarPark = sequelize.define('CarPark', {
        carpark_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        location: {
            type: DataTypes.STRING
        },
        hasEVCharging: { 
            type: DataTypes.BOOLEAN,
            defaultValue: false
          },
          openTime: { 
            type: DataTypes.TIME
          },
          closeTime: { 
            type: DataTypes.TIME
          },
          accessInstructions: {
            type: DataTypes.STRING,
            allowNull: true
          }
    });
    return CarPark;
};
