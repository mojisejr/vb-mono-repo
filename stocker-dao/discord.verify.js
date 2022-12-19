const { ethers } = require("ethers");

const {
  getDataByDiscord,
  saveVerifiedData,
  updateVerificationStatus,
} = require("./csv/verify.service");

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
    await interaction.reply("ตรวจสอบเลขกระเป๋าหน่อย อาจจะผิดนะ ! 🥹");
    return;
  }
  if (interaction.deferred == false) {
    await interaction.deferReply();
  }
  // interaction.reply("ขอตรวจกระเป๋าหน่อยนะ .. 🤖");
  const verified = await isVerified(discordName);
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
      await interaction.editReply(
        `@${discordName} 🌟 ยินต้อนรับสู่บ้าน Stocker DAO มามุ่งสู่การเป็น Star กันเถอะ!! 🌟`
      );
      await giveRole(client, discordId);
    } else {
      //update to verified again
      console.log(
        `found address: @${wallet} update verification status to: ${true}`
      );
      await interaction.editReply(
        `@${discordName} 🌟 ยินดีต้อนรับกลับสู่บ้าน Stocker DAO ! [Welcome Back!] 🌟`
      );
      updateVerificationStatus(wallet, true);
      await giveRole(client, discordId);
    }
  } else if (balance > 0 && verified) {
    console.log(`@${wallet} is verified. `);
    await interaction.editReply(
      `@${discordName} 🌟 คุณเป็นเด็กฝึกค่ายเราอยู่แล้วนี่... [Already Verified!] 🌟`
    );
    await giveRole(client, discordId);
  } else {
    console.log(`@${wallet} has no stocker dao nft!`);
    await interaction.editReply(
      `@${discordName} 🌟 ฮั่นแหน่ ยังไม่มีน้องดาวอยู่ในกระเป๋านี่น่า ถ้าอยากมาอยู่แก๊งเรา ก็ต้องไปจัดแล้วแหละ! 🌟`
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

module.exports = {
  checkVerifyHolder,
  getHolderBalance,
  sendBackMessage,
};
