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
        date: {
            type: DataTypes.DATE
        },
        duration: {
            type: DataTypes.INTEGER
        },
        bay_id: {
            type: DataTypes.INTEGER,
            references: { model: 'Bay', key: 'bay_id' }
        },
        payment_id: {
            type: DataTypes.INTEGER,
            references: { model: 'Payment', key: 'payment_id' }
        }
    });
    return CarParkLog;
};
