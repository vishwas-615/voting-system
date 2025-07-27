const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
const { getContractAndDefaultAccount } = require('../scripts/contractConfig');
const User = require('../models/Users');

/**
 * @swagger
 * /votes:
 *   post:
 *     summary: Cast a vote
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               candidateName:
 *                 type: string
 *               electionTitle:
 *                 type: string
 *     responses:
 *       200:
 *         description: Vote cast successfully
 */
router.post("/", async (req, res) => {
  try {
    const { email, candidateName, electionTitle } = req.body;
    const { contract } = await getContractAndDefaultAccount();

    const candidate = await Candidate.findOne({ name: candidateName });
    const election = await Election.findOne({ title: electionTitle });
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const userEthAddress = user.ethAddress;

    if (!candidate || !election) {
      return res.status(404).json({ message: 'Candidate or election not found' });
    }

    // Ensure candidate belongs to same election
    if (!candidate.election_id.equals(election._id)) {
      return res.status(400).json({ message: 'Candidate does not belong to this election' });
    }
    console.log("Casting vote for:", { candidateName, electionTitle });
    console.log("Casting vote for id:", { electionId: election._id, candidateId: candidate._id });
    const tx = await contract.methods
      .vote(email, election._id.toString(), candidate._id.toString())
      .send({ from: userEthAddress });
    res.json({ txHash: tx.transactionHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /votes/count:
 *   get:
 *     summary: Get vote count for a candidate in an election
 *     parameters:
 *       - in: query
 *         name: electionId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the election
 *       - in: query
 *         name: candidateId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the candidate
 *     responses:
 *       200:
 *         description: Vote count retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 electionId:
 *                   type: string
 *                 candidateId:
 *                   type: string
 *                 voteCount:
 *                   type: string
 */
// GET /votes/count?electionId=...&candidateId=...
router.get('/count', async (req, res) => {
  try {
    const { electionId, candidateId } = req.query;
    const { contract } = await getContractAndDefaultAccount();

    if (!electionId || !candidateId) {
      return res.status(400).json({ message: 'electionId and candidateId are required' });
    }

    const count = await contract.methods.getVoteCount(electionId, candidateId).call();
    res.json({ electionId, candidateId, voteCount: count.toString() });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vote count', error: error.message });
  }
});

// GET /votes/counts
router.get('/counts', async (req, res) => {
  try {
    const { contract } = await getContractAndDefaultAccount();
    const result = await contract.methods.getAllVoteCounts().call();

    // result: { electionIds: [...], candidateIds: [...], counts: [...] }
    const voteCounts = result.electionIds.map((electionId, idx) => ({
      electionId,
      candidateId: result.candidateIds[idx],
      count: result.counts[idx].toString() // Ensure count is string for JSON
    }));

    res.json(voteCounts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all vote counts', error: error.message });
  }
});

/**
 * @swagger
 * /votes/all:
 *   get:
 *     summary: Get all votes
 *     responses:
 *       200:
 *         description: List of all votes
 */
// GET /votes/all
router.get('/all', async (req, res) => {
  try {
    const { contract } = await getContractAndDefaultAccount();
    const votes = await contract.methods.getAllVotes().call();

    const voteList = votes.electionIds.map((electionId, idx) => ({
      electionId,
      candidateId: votes.candidateIds[idx],
      email: votes.email[idx],
    }));

    res.json(voteList);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching votes', error: error.message });
  }
});

module.exports = router;