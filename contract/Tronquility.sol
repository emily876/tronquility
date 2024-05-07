// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

import "./Trc.sol";

contract Tronquility is TRC721, TRC721Metadata, TRC721MetadataMintable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;
    
   string public constant MAJOR_ARCANA_URI = "ipfs://bafybeihrnhjv4ceqvltg3mygifiukety4suhzbd7q2givhbepucvl2xn2e/";
    string[22] private MAJOR_ARCANA_NAME = [
        "0 The Fool",
        "I The Magician",
        "II The High Priestess",
        "III The Empress",
        "IV The Emperor",
        "V The Hierophant",
        "VI The Lovers",
        "VII The Chariot",
        "VIII Strength",
        "IX The Hermit",
        "X The Wheel of Fortune",
        "XI Justice",
        "XII The Hanged Man",
        "XIII Death",
        "XIV Temperance",
        "XV The Devil",
        "XVI The Tower",
        "XVII The Star",
        "XVIII The Moon",
        "XIX The Sun",
        "XX Judgement",
        "XXI The World"
    ];
    
    
    constructor() public TRC721Metadata("Tronquility", "TQ") {}
    
    /////////////////////////
    //   ENTRY FUNCTIONS   //
    ////////////////////////
    function drawCards() public view returns (string memory){
        uint256 card_index = random(22);
        string memory card = MAJOR_ARCANA_NAME[card_index];
        string memory position;
        if(random(2) == 0){
            position = "reverse";
        }else{
            position = "upright";
        }
        
        string memory card_uri = string(abi.encodePacked(MAJOR_ARCANA_URI, uintToStr(card_index)));
        card_uri = concat(card_uri, ".png");
        string memory output = concat(card, "; ");
        output = concat(output, position);
        output = concat(output, "; ");
        output = concat(output, card_uri);
        return output;
    }
    
    function mintReading(address to, string memory tokenURI) public {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        mintWithTokenURI(to, tokenId, tokenURI);
    }
    
    ///////////////////////////////
    //   PUBLIC VIEW FUNCTIONS   //
    //////////////////////////////
    function getCurrentTokenId() public view returns (uint) {
        return _tokenIdCounter.current();
    }
    
    //////////////////////////
    //   HELPER FUNCTIONS   //
    /////////////////////////
//     function random(uint256 upper_limit_excluded) internal view returns (uint256) {
//         uint256 rand = uint256(keccak256(abi.encodePacked(
//             tx.origin,
//             blockhash(block.number - 1),
//             block.timestamp
//         )));
//         return rand % upper_limit_excluded;
//   }
  
    function random(uint256 upper_limit_exclude) private view returns (uint) {
        uint randomHash = uint(keccak256(abi.encodePacked(block.difficulty, now)));
        return randomHash % upper_limit_exclude;
    } 
      
    function concat(string memory a, string memory b) internal pure returns (string memory){
      return string(abi.encodePacked(a, b));
    }
  
    function uintToStr(uint _i) internal pure returns (string memory _uintAsString) {
        uint number = _i;
        if (number == 0) {
            return "0";
        }
        uint j = number;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len - 1;
        while (number != 0) {
            bstr[k--] = byte(uint8(48 + number % 10));
            number /= 10;
        }
        return string(bstr);
    }
    
    function indexOf(string[] memory arr, string memory searchFor) pure private returns (int) {
        for (uint i = 0; i < arr.length; i++) {
            if (keccak256(abi.encodePacked(arr[i])) == keccak256(abi.encodePacked(searchFor))) {
            return int(i);
            }
        }
        return -1; // not found
    }
}
