const marketAbi = [
  "event ListingCreated(address indexed seller, address indexed nftContract, uint256 indexed tokenId, uint256 price, uint256 createdAt, uint256 listingId)",
  "event ItemSold(address indexed buyer, address indexed nftContract, uint256 indexed tokenId, address seller, uint256 soldAt, uint256 listingId)",
  "function idToListing(uint256) view returns(uint256 listingId, address nftContract, uint256 tokenId, address exchangeToken, uint256 price, address seller, address buyer, uint256 createdAt, uint256 withdrawAt, uint256 soldAt, bool isKAP1155)",
];

const marketAddress = "0x874987257374cAE9E620988FdbEEa2bBBf757cA9";

module.exports = {
  marketAbi,
  marketAddress,
};
