const { Sequelize } = require("sequelize");
const basePath = process.cwd();

const sequelize = new Sequelize("game-state-db", "user", "pass", {
  dialect: "sqlite",
  host: `./`,
  logging: true,
});

module.exports = sequelize;
