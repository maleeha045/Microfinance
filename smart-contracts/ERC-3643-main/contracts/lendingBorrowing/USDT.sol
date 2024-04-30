// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract USDT is ERC20, ERC20Burnable, Ownable, ERC20Permit {
    constructor()
        ERC20("MyToken", "MTK")
        Ownable()
        ERC20Permit("MyToken")
    {}


    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }


}
