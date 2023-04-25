pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ICryptodevs.sol";

error youDonthaveAnyNfts();
error alreadyClaimed();
error maxtokensExceeding();

contract CryptoDevToken  is ERC20,Ownable {

    uint public constant maxTokens = 10000 * 10**18;
    uint public constant claimableTokens = 10 ether;
    uint public constant price = 0.001 ether;

    mapping(uint=>bool) public isIdMinted;

    mapping(address=>mapping(uint=>bool)) public hasClaimed;

    ICryptodevs public nft;

    constructor(address _nft) ERC20("CD", "Cryptodev"){
        nft = ICryptodevs(_nft);
    }

    function claim() public  {
        uint temp = nft.balanceOf(msg.sender);
        uint amount=0;

        if(temp==0){
            revert youDonthaveAnyNfts();
        }
        for(uint i = 0; i<temp;i++){
          uint temp2 = nft.tokenOfOwnerByIndex(msg.sender,i);
        //   require(isIdMinted[temp2],"This nft is already claimed");
          if(!isIdMinted[temp2]){
              amount++; 
            isIdMinted[temp2]=true;   
          }
        }

        if(amount==0){
            revert alreadyClaimed();
        }

        _mint(msg.sender,amount*claimableTokens);
    }

    function mint(uint amount) public payable {
        if(totalSupply() + (amount* 10**18) > maxTokens)
        {
            revert maxtokensExceeding();
        }   
        uint temp = amount*price;
        require(msg.value>=temp,"Insufficient amount");
        _mint(msg.sender,amount * 10**18);
    }

    function withdraw() public onlyOwner{
          require(address(this).balance >0,"Nothing to withdraw");
          (bool sent,)= owner().call{value:address(this).balance}("");
          require(sent, "failed to withdraw");
    }

    receive() external payable {}

    fallback() external payable {}
}