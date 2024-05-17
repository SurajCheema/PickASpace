const db = require('../models');

before(async function () {
  await db.sequelize.sync({ force: true });
});

after(async function () {
  await db.sequelize.close();
});
