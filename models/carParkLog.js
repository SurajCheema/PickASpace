module.exports = (sequelize, DataTypes) => {
    const CarParkLog = sequelize.define('CarParkLog', {
        log_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        carpark_id: {
            type: DataTypes.INTEGER,
            references: { model: 'CarPark', key: 'carpark_id' }
        },
        user_id: {
            type: DataTypes.INTEGER,
            references: { model: 'User', key: 'user_id' }
        },
        bay_id: {
            type: DataTypes.INTEGER,
            references: { model: 'Bay', key: 'bay_id' }
        },
        payment_id: {
            type: DataTypes.INTEGER,
            references: { model: 'Payment', key: 'payment_id' }
        },
        startTime: {
            type: DataTypes.DATE,
            allowNull: false
        },
        endTime: {
            type: DataTypes.DATE,
            allowNull: false
        }
    });

    CarParkLog.associate = (models) => {
        CarParkLog.belongsTo(models.CarPark, { foreignKey: 'carpark_id', as: 'carPark' });
        CarParkLog.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
        CarParkLog.belongsTo(models.Bay, { foreignKey: 'bay_id', as: 'bay' });
        CarParkLog.belongsTo(models.Payment, { foreignKey: 'payment_id', as: 'payment' });
    };

    return CarParkLog;
};
