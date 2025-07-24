const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
const { getContractAndDefaultAccount } = require('../scripts/contractConfig');


router.post("/", async (req, res) => {
  try {
    const { candidateName, electionTitle } = req.body;
    const { contract, defaultAccount } = await getContractAndDefaultAccount();
    
    // const userDetail = await contract.methods.getUserByEmail(email).call();
    const candidate = await Candidate.findOne({ name: candidateName });
    const election = await Election.findOne({ title: electionTitle });

    if (!candidate || !election) {
      return res.status(404).json({ message: 'Candidate or election not found' });
    }

        // Ensure candidate belongs to same election
    if (!candidate.election_id.equals(election._id)) {
      return res.status(400).json({ message: 'Candidate does not belong to this election' });
    }
    console.log("Casting vote for:", {candidateName, electionTitle });
    const tx = await contract.methods
      .vote(election._id.toString(), candidate._id.toString())
      .send({ from: defaultAccount });
    res.json({ txHash: tx.transactionHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /votes
// router.post('/', async (req, res) => {
//   try {
//     const { email, candidateName, electionTitle } = req.body;

//     const user = await User.findOne({ email });
//     const candidate = await Candidate.findOne({ name: candidateName });
//     const election = await Election.findOne({ title: electionTitle });

//     if (!user || !candidate || !election) {
//       return res.status(404).json({ message: 'User, candidate, or election not found' });
//     }

//     // Ensure candidate belongs to same election
//     if (!candidate.election_id.equals(election._id)) {
//       return res.status(400).json({ message: 'Candidate does not belong to this election' });
//     }

//     const vote = new Vote({
//       user_id: user._id,
//       candidate_id: candidate._id,
//       election_id: election._id
//     });

//     await vote.save();
//     res.status(201).json({ message: 'Vote cast successfully' });
//   } catch (err) {
//     if (err.code === 11000) {
//       res.status(400).json({ message: 'User has already voted in this election' });
//     } else {
//       res.status(500).json({ message: 'Error casting vote' });
//     }
//   }
// });

// // GET /votes
// router.get('/', async (req, res) => {
//   const votes = await Vote.find()
//     .populate('user_id', 'name')
//     .populate('candidate_id', 'name')
//     .populate('election_id', 'title');
//   res.json(votes);
// });


// // GET /votes/by-user-email?email=...
// router.get('/by-user-email', async (req, res) => {
//   try {
//     const { email } = req.query;

//     if (!email) {
//       return res.status(400).json({ message: 'Email is required' });
//     }

//     // Find user by email
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Find all votes by this user
//     const votes = await Vote.find({ user_id: user._id })
//       .populate({
//         path: 'candidate_id',
//         select: 'name bio'
//       })
//       .populate({
//         path: 'election_id',
//         select: 'title description'
//       });

//     res.json({
//       user: {
//         _id: user._id,
//         name: user.name,
//         email: user.email
//       },
//       votes: votes.map(vote => ({
//         voted_at: vote.voted_at,
//         election: vote.election_id,
//         candidate: vote.candidate_id
//       }))
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Error retrieving vote details' });
//   }
// });

module.exports = router;
