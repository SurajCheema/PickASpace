module.exports = (sequelize, DataTypes) => {
    const CreditCard = sequelize.define('CreditCard', {
        card_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        current_balance: {
            type: DataTypes.DECIMAL,
            allowNull: false,
            defaultValue: 0.00
        }
    }, {
    });

    CreditCard.associate = function(models) {
        CreditCard.belongsTo(models.User, { foreignKey: 'user_id' });
    };

    return CreditCard;
};
