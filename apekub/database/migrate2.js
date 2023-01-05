require("dotenv").config();

const {
  punkkubBotToken,
  punkkub,
  bitkubMainnet,
  verifyChannelId,
  clientId,
  role,
} = process.env;

const { Collection } = require("./firestore");
const { ethers } = require("ethers");
const { Sequelize, DataTypes, Model } = require("sequelize");
const { bot } = require("../discord.bot");
const { giveRole, takeRole } = require("../discord.role");

const sequelize = new Sequelize("whos-hodl", "non", "apollo2022team@-<A", {
  host: "188.166.65.114",
  port: 5432,
  dialect: "postgres",
});

sequelize.sync().then(() => console.log("PSQL: synced!!"));

async function migrate() {
  const address = "0x6D5724cc5125C2de0DebACb779A11307B3AbADE9";
  const abi = ["function balanceOf(address _owner) view returns(uint256)"];
  const provider = new ethers.providers.JsonRpcProvider(
    "https://rpc.bitkubchain.io"
  );
  const contract = new ethers.Contract(address, abi, provider);
  const snapshot = await Collection.Holder.get();
  //find all data from firebase
  const results = await Promise.all(
    snapshot.docs.map(async (doc) => {
      const balanceOf = parseInt((await contract.balanceOf(doc.id)).toString());
      return {
        nftAddress: address,
        walletAddress: doc.id,
        balance: balanceOf,
        verified: balanceOf <= 0 ? false : true,
        discordId: doc.data().discordId,
        timestamp: new Date().getTime(),
      };
    })
  );
  console.log(results);
  await Holder.bulkCreate(results).catch((e) =>
    console.log("bulk creation failed,", e)
  );
}

async function updateRoles() {
  const results = await Holder.findAll({
    where: { nftAddress: punkkub, verified: false },
  });

  const data = results.map((r) => r.dataValues);

  data.forEach(async (d) => {
    console.log("updated role for : ", d.discordId);
    await takeRole(bot, d.discordId);
  });
}

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

// migrate();
bot.on("ready", async () => {
  await updateRoles();
});