require("dotenv").config({
  path: "./config.env",
});
const Holder = require("../model/holder.model");
const { punkkub } = process.env;

async function addVerifiedHolder(data, nftAddress) {
  const { wallet, discordName, discordId, timestamp, lastbalance, verified } =
    data;

  const { holder, created } = await Holder.findOrCreate({
    where: { walletAddress: wallet, nftAddress: punkkub },
    defaults: {
      walletAddress,
      nftAddress: punkkub,
      discordId,
      timestamp,
      balance: lastbalance,
      verified,
    },
  });

  if (created) {
    return holder;
  } else {
    return null;
  }
}

async function updateHolderStateByWallet(walletAddress, balance, status) {
  const result = await Holder.update(
    { verified: status, balance },
    { where: { walletAddress, nftAddress: punkkub } }
  );

  return result <= 0 ? false : true;
}

async function getAllVerifiedHolders() {
  const results = await Holder.findAll({
    where: { verified: true, nftAddress: punkkub },
  });

  return results.length <= 0 ? [] : results.map((r) => r.dataValues);
}

// async function getHolderByDiscordName() {}
async function getHolderByDiscordId(discordId) {
  const result = await Holder.findOne({
    where: { discordId, nftAddress: punkkub },
  });
  return !result ? null : result.dataValues;
}
async function getHolderByWallet(wallet) {
  const result = await Holder.findOne({
    where: { walletAddress: wallet, nftAddress: punkkub },
  });
  return !result ? null : result.dataValues;
}

module.exports = {
  getAllVerifiedHolders,
  addVerifiedHolder,
  updateHolderStateByWallet,
  getHolderByDiscordId,
  getHolderByWallet,
};
