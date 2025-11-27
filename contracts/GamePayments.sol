// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title GamePayments
 * @dev Handles ARD token payments for game features
 */
contract GamePayments is Ownable, ReentrancyGuard {
    IERC20 public ardToken;
    address public treasury;

    // Events
    event PaymentReceived(address indexed player, uint256 amount, string reason);
    event RewardSent(address indexed player, uint256 amount, string reason);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);

    constructor(address _ardToken, address _treasury) Ownable(msg.sender) {
        require(_ardToken != address(0), "Invalid token address");
        require(_treasury != address(0), "Invalid treasury address");
        
        ardToken = IERC20(_ardToken);
        treasury = _treasury;
    }

    /**
     * @dev Player pays tokens to treasury
     * @param amount Amount of tokens to pay (in wei, 18 decimals)
     */
    function payTokens(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(ardToken.balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        // Transfer tokens from player to treasury
        require(
            ardToken.transferFrom(msg.sender, treasury, amount),
            "Transfer failed"
        );

        emit PaymentReceived(msg.sender, amount, "Game payment");
    }

    /**
     * @dev Send reward to player (only owner/backend)
     * @param player Address of the player
     * @param amount Amount of tokens to send (in wei, 18 decimals)
     */
    function sendReward(address player, uint256 amount) external onlyOwner nonReentrant {
        require(player != address(0), "Invalid player address");
        require(amount > 0, "Amount must be greater than 0");
        require(ardToken.balanceOf(treasury) >= amount, "Insufficient treasury balance");

        // Transfer tokens from treasury to player
        require(
            ardToken.transferFrom(treasury, player, amount),
            "Transfer failed"
        );

        emit RewardSent(player, amount, "Game reward");
    }

    /**
     * @dev Update treasury address (only owner)
     */
    function updateTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid treasury address");
        address oldTreasury = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }

    /**
     * @dev Get player's ARD balance
     */
    function getPlayerBalance(address player) external view returns (uint256) {
        return ardToken.balanceOf(player);
    }

    /**
     * @dev Get treasury balance
     */
    function getTreasuryBalance() external view returns (uint256) {
        return ardToken.balanceOf(treasury);
    }
}
