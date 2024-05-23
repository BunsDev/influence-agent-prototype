// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @notice A contract that stores USD tokens.
 */
contract USDToken is ERC20 {
    constructor() ERC20("USD Token", "USDT") {
        _mint(msg.sender, 1000 * 1000 * 10 ** decimals());
    }

    function mint(uint256 amount) external {
        _mint(msg.sender, amount * 10 ** decimals());
    }
}
