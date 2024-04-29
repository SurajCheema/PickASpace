'use strict';

module.exports = (sequelize, DataTypes) => {
    const CarParkLog = sequelize.define('CarParkLog', {
        log_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        carpark_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'CarParks',
                key: 'carpark_id'
            }
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'user_id'
            }
        },
        bay_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Bays',
                key: 'bay_id'
            }
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
            defaultValue: 'reserved',
            validate: {
                isIn: [['reserved', 'active', 'cancelled', 'completed', 'refunded']]
            }
        },
    });

    return CarParkLog;
};