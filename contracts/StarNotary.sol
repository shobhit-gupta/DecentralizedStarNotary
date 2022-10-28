// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.6.0 <0.9.0;

//Import openzeppelin-solidity ERC-721 implementation
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// StarNotary Contract declaration. Inherits the ERC721 openzeppelin implementation.
contract StarNotary is ERC721 {

    // Star data
    struct Star { 
        string name;
    }

    // Associate the token with the Star.
    mapping(uint256 => Star) public tokenIdToStar;
    // Associate the token with it's price.
    mapping(uint256 => uint256) public starsForSale;


    // Call ERC721 constructor with relevant details.
    // Without this call this would be an abstract contract.
    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {}


    // Create Star using the Struct
    function createStar(string memory _name, uint256 _tokenId) public {
        // Create a new star with the provided details
        Star memory newStar = Star(_name);  
        // Assoicate the star with the token.
        tokenIdToStar[_tokenId] = newStar;  
        // Assign msg.sender as the owner of the token
        _mint(msg.sender, _tokenId);    
    }


    // Put a Star for sale by adding the star tokenid into the mapping starsForSale.
    // First verify that the sender is indeed the star's owner)
    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(ownerOf(_tokenId) == msg.sender, "You can't sell the Star you don't own");
        starsForSale[_tokenId] = _price;
    }


    // Buy any star that are listed for sale.
    function buyStar(uint256 _tokenId) public payable {
        uint256 cost = starsForSale[_tokenId];
        require(cost > 0, "The Star is not up for sale");
        require(msg.value >= cost, "Not enough ether provided");

        // Get the current owner of the token
        address owner = ownerOf(_tokenId);
        
        // Pass the ownership of token to the new owner, i.e msg.sender
        _transfer(owner, msg.sender, _tokenId);

        // Charge the cost of the star from the new owner
        payable(owner).transfer(cost);
        
        // Send back the change
        if (msg.value > cost) {
            payable(msg.sender).transfer(msg.value - cost);
        }
    }


    // Implement Task 1 lookUptokenIdToStarInfo
    function lookUptokenIdToStarInfo (uint _tokenId) public view returns (string memory) {
        return tokenIdToStar[_tokenId].name;
    }

}