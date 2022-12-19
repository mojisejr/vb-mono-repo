require("dotenv").config();
const { Client, Intents, MessageEmbed } = require("discord.js");

const { checkVerifyHolder } = require("./discord.verify");

const intents = new Intents();

intents.add(
  Intents.FLAGS.GUILDS,
  Intents.FLAGS.GUILD_MEMBERS,
  Intents.FLAGS.GUILD_MESSAGES
);

const client = new Client({
  intents,
});

const ethers = require("ethers");
const { giveRole, takeRole } = require("./discord.role");
const { getHolderBalance } = require("./discord.verify");
const BKCMainnetUrl = process.env.bitkubMainnet;
const BKCProvider = new ethers.providers.JsonRpcProvider(BKCMainnetUrl);

client.once("ready", async () => {
  console.log("apekub-discord is ready");
});

client.login(process.env.punkkubBotToken);

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  //format data
  const inputData = {
    wallet: interaction.options.data[0].value,
    discordId: interaction.user.id,
    discordName: interaction.user.tag,
    timestamp: Date.now(),
  };

  //verify check
  try {
    await checkVerifyHolder(inputData, client, interaction);
  } catch (e) {
    console.log("error on verification: ", e.message);
  }
});

//TRANSFER UPDATE ROLE
const punkkub = new ethers.Contract(
  process.env.punkkub,
  [
    "function tokenURI(uint256 _tokenId) view returns(string memory)",
    "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  ],
  BKCProvider
);
//check if receiver is marketplace
function isMarketPlace(to) {
  let marketPlaceAddress = "0x874987257374cAE9E620988FdbEEa2bBBf757cA9";
  let middleAddress = "0xA51b0F76f0d7d558DFc0951CFD74BB85a70E2a95";

  if (to === marketPlaceAddress || to === middleAddress) {
    return true;
  } else {
    return false;
  }
}

process.on("uncaughtException", (error) => {
  console.log(error);
});

//tracking transfer event for give discord user a role and nickname
punkkub.on("Transfer", async (from, to, tokenId) => {
  if (isMarketPlace(to)) {
    await onTransferUpdateRole(from);
  } else if (isMarketPlace(from)) {
    await onTransferUpdateRole(to);
  } else {
    await onTransferUpdateRole(to);
    await onTransferUpdateRole(from);
  }
});

async function onTransferUpdateRole(wallet) {
  const holderData = await getDataByWallet(wallet);
  const balance = await getHolderBalance(wallet);
  if (balance > 0 && holderData && holderData.wallet == wallet) {
    console.log(`@${wallet} : is holder.`);
    await giveRole(client, holderData.discordId);
    await updateVerificationStatus(wallet, balance, true);
  } else if (balance <= 0 && holderData && holderData.wallet == wallet) {
    console.log(`@${wallet} : is NOT holder`);
    await takeRole(client, holderData.discordId);
    await updateVerificationStatus(wallet, balance, false);
  } else {
    console.log(`transfer from non-verified holder. @${wallet}`);
  }
}

module.exports = {
  bot: client,
};
