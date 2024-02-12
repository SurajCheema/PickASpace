'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  // Initialize Sequelize with environment variable (useful for production)
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  // Initialize Sequelize with direct configuration (useful for development and testing)
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    // Filter out non-JavaScript files, the current file, and test files
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    // Import model files dynamically and add them to the db object
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  // Invoke associate method on models if defined
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Attach the sequelize instance (connection) and the Sequelize class (library) to the db object
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
