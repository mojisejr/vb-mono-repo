const { Model, DataTypes } = require("sequelize");
const sequelize = require("../database");

class Holder extends Model {}

Holder.init(
  {
    nftAddress: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    discordId: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    walletAddress: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    balance: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    //@NON: unixtimestamp
    timestamp: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  { sequelize }
);

module.exports = Holder;
