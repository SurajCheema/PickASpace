module.exports = (sequelize, DataTypes) => {
  const Bay = sequelize.define('Bay', {
      bay_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
      },
      carpark_id: {
          type: DataTypes.INTEGER,
          references: { model: 'CarPark', key: 'carpark_id' }
      },
      bay_number: {
          type: DataTypes.INTEGER
      },
      taken: {
          type: DataTypes.BOOLEAN
      }
  });
  return Bay;
};
