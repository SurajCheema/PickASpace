module.exports = (sequelize, DataTypes) => {
    const CarPark = sequelize.define('CarPark', {
        carpark_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        location: {
            type: DataTypes.STRING
        }
    });
    return CarPark;
};
