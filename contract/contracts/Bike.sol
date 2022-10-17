// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
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
    ReentrancyGuard
{
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    string public baseURI;

    uint256 private _fee = 0.01 ether;

    uint256 public supply;

    constructor(address owner, uint256 _supply) ERC721("Bike", "BIKE") {
        super._transferOwnership(owner);
        baseURI = "https://gateway.pinata.cloud/ipfs/QmRvnhYrUaeHLF8hSeRNTdTVn5JTHas5eZk8Wy2RbzwRAq";
        supply = _supply;
    }

    function getFee() public view returns (uint256) {
        return _fee;
    }

    function setFee(uint256 fee) public onlyOwner {
        _fee = fee * (1e17);
    }

    function contractURI() public pure returns (string memory) {
        return
            "https://gateway.pinata.cloud/ipfs/QmNufWreLh7wf4Leat2pxzg92mQi6M6cjW767pafoDSChJ/contract_metadata.json";
    }

    function setBaseURI(string memory newBaseURI) public onlyOwner {
        baseURI = newBaseURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function setTotalSupply(uint256 newSupply) public onlyOwner {
        supply = newSupply;
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

    function safeMint(address to) public payable {
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        require(tokenId <= supply, "Out of supply");
        require(msg.value >= _fee, "Not enough balance");
        _safeMint(to, tokenId);
    }

    function safeMintMany(address to, uint256 amount) public payable {
        require(
            (_tokenIdCounter.current() + amount) <= supply,
            "Out of supply"
        );
        require(msg.value >= amount * _fee, "Not enough balance");
        uint256 tokenId;
        for (uint8 i = 0; i < amount; i++) {
            _tokenIdCounter.increment();
            tokenId = _tokenIdCounter.current();
            _safeMint(to, tokenId);
        }
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721Royalty) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721)
        returns (string memory)
    {
        _requireMinted(tokenId);

        string memory uri = _baseURI();
        return bytes(uri).length > 0 ? string(abi.encodePacked(uri)) : "";
    }

    function withdraw() public nonReentrant onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Royalty)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
