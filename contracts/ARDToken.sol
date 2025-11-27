// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ARDToken
 * @dev ERC20 Token for ARD Arena game payments
 */
contract ARDToken is ERC20, Ownable {
    uint8 private _decimals = 18;

    constructor() ERC20("ARD Token", "ARD") Ownable(msg.sender) {
        // Mint initial supply to deployer (10 million ARD)
        _mint(msg.sender, 10_000_000 * 10**decimals());
    }

    /**
     * @dev Mint new tokens (only owner)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Burn tokens
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    /**
     * @dev Override decimals
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
}
