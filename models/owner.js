module.exports = (sequelize, DataTypes) => {
    const Owner = sequelize.define('Owner', {
        owner_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        carpark_id: {
            type: DataTypes.INTEGER
        }
    });
    return Owner;
};