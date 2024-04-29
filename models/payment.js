'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Payments', {
            payment_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            stripePaymentId: {
                type: Sequelize.STRING,
                allowNull: true
            },
            amount: {
                type: Sequelize.DECIMAL
            },
            paymentStatus: {
                type: Sequelize.STRING,
                defaultValue: 'pending' // Example values: pending, completed, failed, refunded
            },
            refundStatus: {
                type: Sequelize.STRING,
                defaultValue: 'none' // Example values: none, requested, approved, processed, denied
            },
            stripeRefundId: {
                type: Sequelize.STRING,
                allowNull: true
            },
            receiptUrl: {
                type: Sequelize.STRING,
                allowNull: true
            },
            date_paid: {
                type: Sequelize.DATE
            },
            userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'user_id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Payments');
    }
};