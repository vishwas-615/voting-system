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
        string password;
        string locationId;
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

    struct VoteRecord {
        string electionId;
        string candidateId;
        string email;
    }

    VoteRecord[] public voteRecords;

    mapping(uint => Location) public locations;
    uint public locationCount;

    mapping(address => User) public users;

    mapping(uint => Candidate) public candidates;
    uint public candidateCount;

    mapping(uint => Election) public elections;
    uint public electionCount;

    mapping(string => mapping(address => bool)) public hasVoted; // electionId => user => voted
    mapping(string => mapping(string => uint)) public votes; // electionId => candidateId => count
    mapping(string => address) private emailToAddress;

    // modifier onlyDuringElection(string memory _electionId) {
    //     require(
    //         block.timestamp >= elections[_electionId].startTime &&
    //         block.timestamp <= elections[_electionId].endTime,
    //         "Election not active"
    //     );
    //     _;
    // }

    // function addLocation(string memory _name) public {
    //     locations[locationCount] = Location(_name, true);
    //     locationCount++;
    // }

    User[] public userList;
    function registerUser(
        string memory _name,
        string memory _email,
        string memory _password,
        string memory _locationId
    ) public {
        // require(!users[msg.sender].exists, "User already registered");
        // require(locations[_locationId].exists, "Invalid location");

        users[msg.sender] = User(_name, _email, _password, _locationId, true);
        emailToAddress[_email] = msg.sender;
        userList.push(users[msg.sender]);
    }

    function getUserByEmail(
        string memory _email
    )
        public
        view
        returns (
            string memory name,
            string memory email,
            string memory password,
            string memory locationId,
            bool exists
        )
    {
        address userAddr = emailToAddress[_email];
        User memory user = users[userAddr];
        return (
            user.name,
            user.email,
            user.password,
            user.locationId,
            user.exists
        );
    }

    function getAllUsers()
        public
        view
        returns (
            string[] memory names,
            string[] memory emails,
            string[] memory locationIds,
            bool[] memory existsArr
        )
    {
        uint len = userList.length;
        names = new string[](len);
        emails = new string[](len);
        locationIds = new string[](len);
        existsArr = new bool[](len);

        for (uint i = 0; i < len; i++) {
            names[i] = userList[i].name;
            emails[i] = userList[i].email;
            locationIds[i] = userList[i].locationId;
            existsArr[i] = userList[i].exists;
        }
    }

    // function createElection(
    //     string memory _title,
    //     string memory _description,
    //     uint _locationId,
    //     uint _startTime,
    //     uint _endTime
    // ) public {
    //     require(locations[_locationId].exists, "Invalid location");
    //     require(_startTime < _endTime, "Invalid time range");

    //     elections[electionCount] = Election(
    //         _title,
    //         _description,
    //         _locationId,
    //         _startTime,
    //         _endTime,
    //         true
    //     );
    //     electionCount++;
    // }

    // function addCandidate(
    //     string memory _name,
    //     string memory _bio,
    //     uint _electionId
    // ) public {
    //     require(elections[_electionId].exists, "Invalid election");

    //     candidates[candidateCount] = Candidate(_name, _bio, _electionId, true);
    //     candidateCount++;
    // }
    string[] public votedElectionIds;
    string[] public votedCandidateIds;
    function vote(
        string memory _email,
        string memory _electionId,
        string memory _candidateId
    ) public {
        require(users[msg.sender].exists, "User not registered");
        require(!hasVoted[_electionId][msg.sender], "Already voted");

        hasVoted[_electionId][msg.sender] = true;
        votes[_electionId][_candidateId]++;
        voteRecords.push(VoteRecord(_electionId, _candidateId, _email));

        // Track unique electionId
        bool electionExists = false;
        for (uint i = 0; i < votedElectionIds.length; i++) {
            if (
                keccak256(bytes(votedElectionIds[i])) ==
                keccak256(bytes(_electionId))
            ) {
                electionExists = true;
                break;
            }
        }
        if (!electionExists) {
            votedElectionIds.push(_electionId);
        }

        // Track unique candidateId
        bool candidateExists = false;
        for (uint i = 0; i < votedCandidateIds.length; i++) {
            if (
                keccak256(bytes(votedCandidateIds[i])) ==
                keccak256(bytes(_candidateId))
            ) {
                candidateExists = true;
                break;
            }
        }
        if (!candidateExists) {
            votedCandidateIds.push(_candidateId);
        }
    }
    function getAllVotes()
        public
        view
        returns (
            string[] memory electionIds,
            string[] memory candidateIds,
            string[] memory email
        )
    {
        uint len = voteRecords.length;
        electionIds = new string[](len);
        candidateIds = new string[](len);
        email = new string[](len);

        for (uint i = 0; i < len; i++) {
            electionIds[i] = voteRecords[i].electionId;
            candidateIds[i] = voteRecords[i].candidateId;
            email[i] = voteRecords[i].email;
        }
    }
    function getAllVoteCounts()
        public
        view
        returns (
            string[] memory electionIds,
            string[] memory candidateIds,
            uint[] memory counts
        )
    {
        uint len = votedElectionIds.length * votedCandidateIds.length;
        electionIds = new string[](len);
        candidateIds = new string[](len);
        counts = new uint[](len);

        uint idx = 0;
        for (uint i = 0; i < votedElectionIds.length; i++) {
            for (uint j = 0; j < votedCandidateIds.length; j++) {
                electionIds[idx] = votedElectionIds[i];
                candidateIds[idx] = votedCandidateIds[j];
                counts[idx] = votes[votedElectionIds[i]][votedCandidateIds[j]];
                idx++;
            }
        }
    }

    function getVoteCount(
        string memory _electionId,
        string memory _candidateId
    ) public view returns (uint) {
        return votes[_electionId][_candidateId];
    }
}
