//SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import { IERC721Receiver } from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import { ERC721Enumerable } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import { WorldBoatClimateActions, ClimateActionStats } from "./WorldBoatClimateActions.sol";

import "hardhat/console.sol";

/*
 */
contract Protocol is IERC721Receiver {
	struct CO2OffsetProject {
		address projectOwner;
		uint co2OffsetPlanned;
		uint tokenAmountRequired;
		uint co2ActuallyOffset;
		uint projectRegisteredDateTimestamp;
		uint projectId;
		uint regionalCode;
		uint category;
		bool isProjectOpen;
		bytes metadataProject;
	}

	address private _manager;

	mapping(address => CO2OffsetProject) private _projects;
	mapping(address => bool) public _trustedProjects;

	WorldBoatClimateActions private _worldBoatClimateActions;

	constructor() {
		_manager = msg.sender;
	}

	function setup(address _worldBoatClimateActionsAddress) public {
		_worldBoatClimateActions = WorldBoatClimateActions(
			_worldBoatClimateActionsAddress
		);
	}

	function createProject(
		uint _co2OffsetPlanned,
		uint _tokenAmountRequired,
		uint _co2ActuallyOffset,
		uint _projectId,
		uint _regionalCode,
		uint _category,
		bytes calldata _metadataProject
	) public {
		_projects[msg.sender] = CO2OffsetProject(
			msg.sender,
			_co2OffsetPlanned,
			_tokenAmountRequired,
			_co2ActuallyOffset,
			block.timestamp,
			_projectId,
			_regionalCode,
			_category,
			true,
			_metadataProject
		);

		if (!_trustedProjects[msg.sender]) return;

		for (
			uint tokenId = 1;
			tokenId < _worldBoatClimateActions.currentTokenId();
			tokenId++
		) {
			ClimateActionStats memory stat = _worldBoatClimateActions
				.getTokenStats(tokenId);
			if (stat.projectId == 0 || stat.projectId == _projectId) {
				// open to any projects, or project Id matchs
				if (stat.category == _category) {
					_worldBoatClimateActions.projectFulfillment(
						tokenId,
						_co2OffsetPlanned,
						_metadataProject
					);
				}
			}
		}
	}

	function addTrustedProject(address projectAddress) public {
		// some kind of validation
		require(
			msg.sender == _manager,
			"Only manager can add a trusted project"
		);
		_trustedProjects[projectAddress] = true;
	}
}
