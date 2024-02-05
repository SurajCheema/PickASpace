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
