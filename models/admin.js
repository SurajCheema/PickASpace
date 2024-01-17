module.exports = (sequelize, DataTypes) => {
    const Admin = sequelize.define('Admin', {
        admin_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        carpark_id: {
            type: DataTypes.INTEGER
        }
    });
    return Admin;
};