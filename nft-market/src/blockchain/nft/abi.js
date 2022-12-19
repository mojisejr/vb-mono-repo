const nftAbi = [
  "function tokenURI(uint256 _tokenId) view returns(string memory)",
  "function name() view returns(string memory)",
  "function symbol() view returns(string memory)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
];

module.exports = {
  nftAbi,
};
