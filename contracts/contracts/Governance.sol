// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Governance {
    struct Proposal {
        string title;
        string description;
    }

    Proposal[] public proposals;

    function createProposal(string memory _title, string memory _description) public {
        proposals.push(Proposal({
            title: _title,
            description: _description
        }));
    }

    function getAllProposals() public view returns (Proposal[] memory) {
        return proposals;
    }
}
