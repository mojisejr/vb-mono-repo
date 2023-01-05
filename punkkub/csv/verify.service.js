const {
  getHolderByDiscordId,
  addVerifiedHolder,
  updateHolderStateByWallet,
} = require("../database/postgres/services/holder.service");

async function getDataByWallet(wallet) {
  const result = await getPunkByWallet(wallet);
  return result;
}

async function getDataByDiscord(discord) {
  const result = await getPunkByDiscordName(discord);
  return result;
}

async function updateVerificationStatus(wallet, balance, status) {
  // await updatePunkVerificationState(wallet, balance, status);
  await updateHolderStateByWallet(wallet, balance, status);
  console.log(`@${wallet} verification status updated to ${status}`);
}

async function saveVerifiedData({
  wallet,
  discordName,
  discordId,
  timestamp,
  lastbalance,
  verified,
}) {
  // const isVerified = await getDataByDiscord(discordName);
  const holder = await getHolderByDiscordId(discordId);
  console.log("isVerified before save: ", holder.verified);
  if (holder.verified) {
    console.log("address already registered");
    return false;
  }

  await addVerifiedHolder({
    wallet,
    discordName,
    discordId,
    timestamp,
    lastbalance,
    verified,
  });

  // await addVerifiedPunk({
  //   wallet,
  //   discordName,
  //   discordId,
  //   lastbalance,
  //   timestamp,
  //   verified,
  // }).then(() => {
  //   console.log(`@${wallet} passed and saved to database`);
  // });

  return true;
}

module.exports = {
  getDataByWallet,
  getDataByDiscord,
  updateVerificationStatus,
  saveVerifiedData,
};
