module.exports = (sequelize, DataTypes) => {
    const CreditCard = sequelize.define('CreditCard', {
        card_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            references: { model: 'Users', key: 'user_id' },
            onDelete: 'CASCADE'
        },
        current_balance: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
        }
    }, {});

    CreditCard.associate = function(models) {
        CreditCard.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    };

    return CreditCard;
};