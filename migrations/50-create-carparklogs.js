module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('CarParkLogs', {
      log_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      carpark_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'CarParks',
          key: 'carpark_id'
        },
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'user_id'
        },
        allowNull: false
      },
      bay_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Bays',
          key: 'bay_id'
        },
        allowNull: true,
        onDelete: 'SET NULL'
      },
      payment_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Payments',
          key: 'payment_id'
        },
        allowNull: true,
        onDelete: 'CASCADE'
      },
      startTime: {
        type: Sequelize.DATE,
        allowNull: false
      },
      endTime: {
        type: Sequelize.DATE,
        allowNull: false
      },
      cost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'reserved',
        validate: {
          isIn: [['reserved', 'active', 'cancelled', 'completed', 'refunded']]
        }
      },
      cancelledAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('CarParkLogs');
  }
};
