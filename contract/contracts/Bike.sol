// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";

contract Bike is
    ERC721,
    Pausable,
    Ownable,
    ERC721Burnable,
    ERC721Royalty,
    ReentrancyGuard,
    ERC721Enumerable,
    ERC721URIStorage
{
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;
    Counters.Counter private _itemIdCounter;

    string public baseURI;

    uint256 private _fee = 0.01 ether;

    string private _uriSuffix = ".json";

    struct Item {
        uint256 id;
        uint256 count;
        string name;
        uint256 quantity;
    }

    Item[] public items;

    constructor(address owner) ERC721("Bike", "BIKE") {
        super._transferOwnership(owner);
        baseURI = "https://gateway.pinata.cloud/ipfs/QmNVtHFqBeQDu5giyc9rzxAPzR5yhuuw2hoGvFyPBRdRxu/";
    }

    function addAmountToken(string memory _itemName, uint256 _quantity)
        public
        onlyOwner
    {
        uint256 itemId = _itemIdCounter.current();
        Item memory newItem = Item(itemId, 0, _itemName, _quantity);
        items.push(newItem);
        _itemIdCounter.increment();
    }

    function getFee() public view returns (uint256) {
        return _fee;
    }

    function setFee(uint256 fee) public onlyOwner {
        _fee = fee * (1e17);
    }

    function contractURI() public pure returns (string memory) {
        return
            "https://gateway.pinata.cloud/ipfs/QmNufWreLh7wf4Leat2pxzg92mQi6M6cjW767pafoDSChJ/";
    }

    function setBaseURI(string memory newBaseURI) public onlyOwner {
        baseURI = newBaseURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function setDefaultRoyalty(address receiver, uint96 feeNumerator)
        external
        onlyOwner
    {
        _setDefaultRoyalty(receiver, feeNumerator);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function safeMintMany(
        uint256 index,
        address to,
        uint256 amount
    ) public payable {
        require(amount <= items[index].quantity, "Out of supply");
        require(msg.value >= amount * _fee, "Not enough balance");
        string memory uri;
        uint256 tokenId;
        for (uint8 i = 0; i < amount; i++) {
            _tokenIdCounter.increment();
            tokenId = _tokenIdCounter.current();

            items[index].count += 1;
            uri = string(
                abi.encodePacked(
                    items[index].name,
                    "_",
                    Strings.toString(items[index].count),
                    _uriSuffix
                )
            );

            _safeMint(to, tokenId);
            _setTokenURI(tokenId, uri);
        }
        items[index].quantity -= amount;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721Royalty, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function withdraw() public nonReentrant onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Royalty, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
