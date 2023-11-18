//SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import { IERC721Receiver } from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import { WorldBoatClimateActions } from "./WorldBoatClimateActions.sol";

import "hardhat/console.sol";

/*
 */
contract Protocol is IERC721Receiver {

	WorldBoatClimateActions private worldBoatClimateActions;

	constructor() {

	}

	function subscribe(address _worldBoatClimateActionsAddress) public {
		worldBoatClimateActions = WorldBoatClimateActions(_worldBoatClimateActionsAddress);
	}

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4) {
		return bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"));
	}
}
