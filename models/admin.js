module.exports = (sequelize, DataTypes) => {
    const Admin = sequelize.define('Admin', {
      admin_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      full_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      DOB: {
        type: DataTypes.DATE,
        allowNull: false
      }
    }, {
      tableName: 'Admins',
      timestamps: true
    });
  
    return Admin;
  };
  