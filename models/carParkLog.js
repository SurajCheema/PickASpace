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
            allowNull: true, 
            references: {
              model: 'Payments',
              key: 'payment_id'
            }
          },
        startTime: {
            type: DataTypes.DATE,
            allowNull: false
        },
        endTime: {
            type: DataTypes.DATE,
            allowNull: false
        },
        cost: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'reserved' // reserved, cancelled, completed, refunded
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
