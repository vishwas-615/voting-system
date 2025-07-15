// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ElectionSystem {
    struct Location {
        string name;
        bool exists;
    }

    struct User {
        string name;
        string email;
        uint locationId;
        bool exists;
    }

    struct Candidate {
        string name;
        string bio;
        uint electionId;
        bool exists;
    }

    struct Election {
        string title;
        string description;
        uint locationId;
        uint startTime;
        uint endTime;
        bool exists;
    }

    mapping(uint => Location) public locations;
    uint public locationCount;

    mapping(address => User) public users;

    mapping(uint => Candidate) public candidates;
    uint public candidateCount;

    mapping(uint => Election) public elections;
    uint public electionCount;

    mapping(uint => mapping(address => bool)) public hasVoted; // electionId => user => voted
    mapping(uint => mapping(uint => uint)) public votes; // electionId => candidateId => count

    modifier onlyDuringElection(uint _electionId) {
        require(
            block.timestamp >= elections[_electionId].startTime &&
            block.timestamp <= elections[_electionId].endTime,
            "Election not active"
        );
        _;
    }

    function addLocation(string memory _name) public {
        locations[locationCount] = Location(_name, true);
        locationCount++;
    }

    function registerUser(string memory _name, string memory _email, uint _locationId) public {
        require(!users[msg.sender].exists, "User already registered");
        require(locations[_locationId].exists, "Invalid location");

        users[msg.sender] = User(_name, _email, _locationId, true);
    }

    function createElection(
        string memory _title,
        string memory _description,
        uint _locationId,
        uint _startTime,
        uint _endTime
    ) public {
        require(locations[_locationId].exists, "Invalid location");
        require(_startTime < _endTime, "Invalid time range");

        elections[electionCount] = Election(
            _title,
            _description,
            _locationId,
            _startTime,
            _endTime,
            true
        );
        electionCount++;
    }

    function addCandidate(
        string memory _name,
        string memory _bio,
        uint _electionId
    ) public {
        require(elections[_electionId].exists, "Invalid election");

        candidates[candidateCount] = Candidate(_name, _bio, _electionId, true);
        candidateCount++;
    }

    function vote(uint _electionId, uint _candidateId) public onlyDuringElection(_electionId) {
        require(users[msg.sender].exists, "User not registered");
        require(!hasVoted[_electionId][msg.sender], "Already voted");
        require(candidates[_candidateId].electionId == _electionId, "Candidate not in this election");

        hasVoted[_electionId][msg.sender] = true;
        votes[_electionId][_candidateId]++;
    }

    function getVoteCount(uint _electionId, uint _candidateId) public view returns (uint) {
        return votes[_electionId][_candidateId];
    }
}
