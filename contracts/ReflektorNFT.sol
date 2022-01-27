// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";

import "./librairies/ContextMixin.sol";

contract ReflektorNFT is ERC721, ContextMixin, Ownable {
    uint256 _baseCost = 0.001 ether;

    struct LetterAttributes {
        uint256 letterIndex;
        uint256 tokenId;
        string letter;
        string metadataURI;
        uint256 price;
    }

    using Strings for uint256;
    using Counters for Counters.Counter;

    LetterAttributes[] defaultLetters;

    mapping(uint256 => LetterAttributes) public nftHolderAttributes;
    mapping(address => uint256) public nftHolders;

    Counters.Counter private _tokenIds;

    event ReflektorNFTMinted(
        address sender,
        uint256 tokenId,
        uint256 letterIndex
    );

    constructor(string[] memory _letters, string memory _baseURI) ERC721("ReflektorNFT", "RFLK") {
        _tokenIds.increment();

        for (uint i = 0; i < _letters.length; i++) {
          uint256 newItemId = _tokenIds.current();

          defaultLetters.push(LetterAttributes({
            letterIndex: i,
            tokenId: newItemId,
            letter: _letters[i],
            metadataURI: string(abi.encodePacked(_baseURI, _letters[i], '.json')),
            price: _baseCost
          }));

          LetterAttributes memory c = defaultLetters[i];
          console.log("letter %s -> index: %d", c.letter, c.letterIndex);

          _tokenIds.increment();
        }
    }

     function _msgSender()
        internal
        override
        view
        returns (address sender)
    {
        return ContextMixin.msgSender();
    }

     function tokenURI(uint256 _tokenId)
        public
        view
        override
        returns (string memory)
    {
        LetterAttributes memory letterAttribute = nftHolderAttributes[
            _tokenId
        ];

        return letterAttribute.metadataURI;
    }

    // payable function, requires a minimium of ether
    function mint(uint256 _letterIndex) public payable {
      LetterAttributes memory letter = defaultLetters[_letterIndex];

      _safeMint(_msgSender(), letter.tokenId);

      nftHolderAttributes[letter.tokenId] = letter;

      console.log(
            "Minted NFT w/ tokenId %s and letterIndex %s",
            letter.tokenId,
            _letterIndex
        );

      nftHolders[_msgSender()] = letter.tokenId;

      emit ReflektorNFTMinted(_msgSender(), letter.tokenId, _letterIndex);
    }

    function checkIfUserHasNFT()
        public
        view
        returns (LetterAttributes memory)
    {
        uint256 userNftTokenId = nftHolders[_msgSender()];
        if (userNftTokenId > 0) {
            return nftHolderAttributes[userNftTokenId];
        } else {
            LetterAttributes memory emptyStruct;
            return emptyStruct;
        }
    }

    function getAllDefaultLetters() public view returns (LetterAttributes[] memory) {
      return defaultLetters;
    }

    // modification for opensea support
    function isApprovedForAll(
        address _owner,
        address _operator
    ) public override view returns (bool isOperator) {
      // if OpenSea's ERC721 Proxy Address is detected, auto-return true
        if (_operator == address(0x58807baD0B376efc12F5AD86aAc70E78ed67deaE)) {
            return true;
        }

        // otherwise, use the default ERC721.isApprovedForAll()
        return ERC721.isApprovedForAll(_owner, _operator);
    }

}
