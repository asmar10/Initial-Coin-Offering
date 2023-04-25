pragma solidity ^0.8.9;

interface ICryptodevs{
    function balanceOf(address) external view returns(uint);
    function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256);
}