module.exports = (sequelize, DataTypes) => {
    const Payment = sequelize.define('Payment', {
        payment_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        stripePaymentId: {
            type: DataTypes.STRING,
            allowNull: true
        },
        amount: {
            type: DataTypes.DECIMAL
        },
        paymentStatus: {
            type: DataTypes.STRING,
            defaultValue: 'pending' // pending, completed, failed, refunded
        },
        receiptUrl: {
            type: DataTypes.STRING,
            allowNull: true
        },
        date_paid: {
            type: DataTypes.DATE
        },
        userId: {
            type: DataTypes.INTEGER,
            references: { model: 'Users', key: 'user_id' }
        }
    });

    Payment.associate = (models) => {
        Payment.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
        Payment.hasOne(models.CarParkLog, { foreignKey: 'payment_id', as: 'log' });
    };

    return Payment;
};