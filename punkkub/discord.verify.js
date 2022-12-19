const { ethers } = require("ethers");

const {
  getDataByDiscord,
  saveVerifiedData,
  updateVerificationStatus,
} = require("./csv/verify.service");
const { log } = require("./database/csv.log.service");
const {
  reverifyCheck,
  deleteHolderData,
} = require("./database/verify.service");

const { giveRole, takeRole } = require("./discord.role");

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
    await interaction.reply({
      content: "ตรวจสอบเลขกระเป๋าหน่อย อาจจะผิดนะ ! 🥹",
      ephemeral: true,
    });
    return;
  }

  // await interaction.reply("ขอตรวจกระเป๋าหน่อยนะ .. 🤖");
  const verified = await isVerified(discordName);
  console.log("verified", verified);

  const balance = await getHolderBalance(wallet);

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
    if (result) {
      console.log(`@${wallet} verification done!`);
      await interaction.reply(
        `@${discordName} ยินต้อนรับ! พังค์พวกกก !! คุณเป็นพวกเราแล้ว! [New Punker!] 🙏🙏🙏🙏`
      );
      await giveRole(client, discordId);
    } else {
      //update to verified again
      console.log(
        `found address: @${wallet} update verification status to: ${true}`
      );
      await interaction.reply(
        `@${discordName} ยินดีต้อนรับกลับมา พังค์พวก !! [Welcome Back!] 🦾🦾🦾`
      );
      const balance = await getHolderBalance(wallet);
      updateVerificationStatus(wallet, balance, true);
      await giveRole(client, discordId);
    }
  } else if (balance > 0 && verified) {
    console.log(`@${wallet} is verified. `);
    await interaction.reply(
      `@${discordName} คุณเป็นชาวพังค์แล้วนี่นา !! [Already Verified!] 😁`
    );
    updateVerificationStatus(wallet, balance, true);
    await giveRole(client, discordId);
  } else {
    console.log(`@${wallet} has no punk!`);
    await interaction.reply(
      `@${discordName} คุณต้องมี punkkub ในกระเป๋าก่อนนะ ค่อยมา verify [Invalid balance] 🚧`
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
async function isVerified(discordName) {
  const data = await getDataByDiscord(discordName);

  if (data != null) {
    return data.verified ? true : false;
  } else {
    return false;
  }
}

async function reverifyHolder(inputData, client, interaction) {
  await log(
    `${interaction.user.id} interaction command name ${
      interaction.commandName
    } input [${
      interaction.options.data.length <= 0
        ? "N/A"
        : interaction.options.data[0].value
    }]`,
    "Verify Process",
    "reverifyHolder Function",
    true
  );

  //TODO:
  //1 check if oldwallet verify and exceute discordid is valid
  //2 check if new wallet has balance
  //3 delete old wallet id
  //4 add new wallet id
  //5 set role
  const { oldWallet, newWallet, discordName, timestamp } = inputData;
  const { result, msg } = await reverifyCheck(
    interaction.user.id,
    oldWallet,
    newWallet
  );
  const hasBalanceInNewWallet = await getHolderBalance(newWallet);
  if (result && hasBalanceInNewWallet > 0) {
    await deleteHolderData(oldWallet);
    await checkVerifyHolder(
      {
        wallet: newWallet,
        discordId: interaction.user.id,
        discordName,
        timestamp,
      },
      client,
      interaction
    );
  } else {
    await interaction.reply({
      content: `🤓 ${msg}`,
      ephemeral: true,
    });
  }
}

module.exports = {
  checkVerifyHolder,
  reverifyHolder,
  getHolderBalance,
  sendBackMessage,
};
