const { Client, Intents, MessageEmbed } = require("discord.js");

const { checkVerifyHolder } = require("./discord.verify");
const {
  getHolderByWallet,
  updateHolderStateByWallet,
} = require("./database/services/holder.service");

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

const punkkub = new ethers.Contract(
  process.env.punkkub,
  // process.env.testNFT,
  [
    "function tokenURI(uint256 _tokenId) view returns(string memory)",
    "function balanceOf(address _owner) view returns(uint256)",
    "event Transfer(address, adddress, uint256)",
  ],
  BKCProvider
);

client.once("ready", async () => {
  console.log("stocker-dao-discord-bot is ready");
});

client.login(process.env.punkkubBotToken);

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  //format data
  try {
    const inputData = {
      wallet: interaction.options.data[0].value,
      discordId: interaction.user.id,
      discordName: interaction.user.tag,
      timestamp: Date.now(),
    };

    //verify check
    switch (interaction.commandName) {
      case "stocker": {
        await checkVerifyHolder(inputData, client, interaction);
        // await interaction.reply(`${interaction.options.data[0].value}`);
        break;
      }
      default:
        break;
    }
  } catch (e) {
    console.log(e);
  }
});

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
  const holderData = await getHolderByWallet(wallet);
  const balance = await getHolderBalance(wallet);
  if (balance > 0 && holderData && holderData.walletAddress == wallet) {
    console.log(`@${wallet} : is holder.`);
    await giveRole(client, holderData.discordId);
    // await updateVerificationStatus(wallet, balance, true);
    await updateHolderStateByWallet(wallet, balance, true);
  } else if (balance <= 0 && holderData && holderData.walletAddress == wallet) {
    console.log(`@${wallet} : is NOT holder`);
    await takeRole(client, holderData.discordId);
    // await updateVerificationStatus(wallet, balance, false);
    await updateHolderStateByWallet(wallet, balance, false);
  } else {
    console.log(`transfer from non-verified holder. @${wallet}`);
  }
}

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

module.exports = {
  bot: client,
};
