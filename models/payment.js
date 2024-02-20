module.exports = (sequelize, DataTypes) => {
    const Payment = sequelize.define('Payment', {
        payment_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        amount: {
            type: DataTypes.DECIMAL
        },
        date_paid: {
            type: DataTypes.DATE
        }
    });

    Payment.associate = (models) => {
        Payment.hasMany(models.CarParkLog, { foreignKey: 'payment_id', as: 'logs' });
    };
    
    return Payment;
};
