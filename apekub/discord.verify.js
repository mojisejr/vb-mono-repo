require("dotenv").config();

const { ethers } = require("ethers");

const {
  getDataByDiscord,
  saveVerifiedData,
  updateVerificationStatus,
} = require("./csv/verify.service");

const { giveRole, takeRole } = require("./discord.role");
const {
  getHolderByDiscordId,
} = require("../stocker-dao/database/services/holder.service");

const BKCMainnetUrl = process.env.bitkubMainnet;
// const BKCMainnetUrl = process.env.bitkubTestnet;
const BKCProvider = new ethers.providers.JsonRpcProvider(BKCMainnetUrl);

const punkkub = new ethers.Contract(
  process.env.punkkub,
  // process.env.testNFT,
  [
    "function tokenURI(uint256 _tokenId) view returns(string memory)",
    "function balanceOf(address _owner) view returns(uint256)",
  ],
  BKCProvider
);

//Check if holder have the right of verification
async function checkVerifyHolder(inputData, client, interaction) {
  const { wallet, discordId, discordName, timestamp } = inputData;
  // if (message.author.bot) {
  //   return;
  // }
  const address = isValidAddress(wallet);
  if (address == null) {
    await interaction.reply("ตรวจสอบเลขกระเป๋าหน่อย อาจจะผิดนะ ! 🥹");
    return;
  }

  // interaction.reply("ขอตรวจกระเป๋าหน่อยนะ .. 🤖");
  const verified = await isVerified(discordId);
  console.log("verified", verified);

  const balance = await getHolderBalance(wallet);

  // await interaction.deferReply();

  if (balance > 0 && !verified) {
    //set user as verified holder
    const result = await saveVerifiedData({
      wallet: address,
      discordName,
      discordId,
      timestamp,
      lastbalance: balance,
      verified: true,
    });

    // await interaction.deferReply({ emphemeral: true });

    if (result) {
      console.log(`@${wallet} verification done!`);
      await interaction.reply(
        `@${discordName} ยินดีต้อนรับ! ชาว Ape คุณเป็นส่วนหนึ่งของป่าแล้ว! [New ApeKub!] 🍌🍌🍌🍌`
      );
      await giveRole(client, discordId);
    } else {
      //update to verified again
      console.log(
        `found address: @${wallet} update verification status to: ${true}`
      );
      await interaction.reply(
        `@${discordName} ยินดีต้อนรับกลับมา ชาว Ape!! [Welcome Back!] 🦾🦾🦾`
      );
      await updateVerificationStatus(wallet, balance, true);
      await giveRole(client, discordId);
    }
  } else if (balance > 0 && verified) {
    console.log(`@${wallet} is verified. `);
    await interaction.reply(
      `@${discordName} คุณเป็นชาว Ape อยู่แล้ว!! [Already Verified!]🦍`
    );
    await giveRole(client, discordId);
  } else {
    console.log(`@${wallet} has no ape!`);
    await interaction.reply(
      `@${discordName} คุณต้องมี ApeKub ในกระเป๋าก่อน แล้วค่อยมาคุยกัน มา verify กันอีกทีครับ เจี๊ยกๆ🚨🚨🙈`
    );
  }
}

//send message back to client
function sendBackMessage(message, client) {
  const channel = client.channels.cache.get(process.env.verifyChannelId);
  channel.send(message);
}

//check if valid address was sent
function isValidAddress(address) {
  let isAddress = address.split("0x");
  if (
    isAddress[0] == "" &&
    isAddress[1].length == 40 &&
    isAddress.length == 2
  ) {
    return address;
  } else {
    console.log("invalid address");
    return null;
  }
}

//get the balance of punk in use wallet
async function getHolderBalance(address) {
  if (address != null) {
    const tokenOfOwner = await punkkub.balanceOf(address);
    return parseInt(tokenOfOwner.toString());
  } else {
    return 0;
  }
}

//check if the sender is verified
async function isVerified(discordId) {
  const data = await getHolderByDiscordId(discordId);
  // const data = await getDataByDiscord(discordName);

  if (data != null) {
    return data.verified ? true : false;
  } else {
    return false;
  }
}

module.exports = {
  checkVerifyHolder,
  getHolderBalance,
  sendBackMessage,
};
