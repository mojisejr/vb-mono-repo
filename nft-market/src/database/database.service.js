const csvtojson = require("csvtojson/v2");
const { createObjectCsvWriter } = require("csv-writer");

const basePath = process.cwd();
const csvWriter = createObjectCsvWriter({
  path: `${basePath}/src/database/nft.csv`,
  header: [
    { id: "id", title: "id" },
    { id: "name", title: "name" },
    { id: "address", title: "address" },
  ],
  append: true,
});

async function getCurrentNftId() {
  const data = await getNftData();
  return data.length;
}

async function getNftData() {
  const dataArray = await csvtojson().fromFile(
    `${basePath}/src/database/nft.csv`
  );

  return dataArray;
}

async function getNFTByAddress(address) {
  const dataArray = await getNftData();
  const found = dataArray.find((data) => data.address == address);
  if (found === undefined) {
    return null;
  } else {
    return found;
  }
}

async function getNFTAddressByName(name) {
  const dataArray = await getNftData();
  const nft = dataArray.find((data) => data.name == name);
  if (nft === undefined) {
    return null;
  } else {
    return nft.address;
  }
}

async function getChannelIdByAddress(address) {
  const nft = await getNFTByAddress(address);
  if (nft !== null) {
    return nft.id;
  } else {
    return "998142058843873295";
  }
  // for testing
  // return "965474646499663954";
}

async function addNewNFT(newNft) {
  const currentId = await getCurrentNftId();
  const nextId = currentId + 1;
  await csvWriter
    .writeRecords([
      { id: nextId.toString(), name: newNft.name, address: newNft.address },
    ])
    .then(() => console.log("write new address done!"));
}

module.exports = {
  addNewNFT,
  getNFTByAddress,
  getChannelIdByAddress,
  getNFTAddressByName,
};
