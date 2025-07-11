const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');

// POST /candidates
router.post('/', async (req, res) => {
  try {
    const { name, bio, electionTitle } = req.body;

    const election = await Election.findOne({ title: electionTitle });
    if (!election) return res.status(404).json({ message: 'Election not found' });

    const candidate = new Candidate({
      name,
      bio,
      election_id: election._id
    });

    await candidate.save();
    res.status(201).json(candidate);
  } catch (err) {
    res.status(500).json({ message: 'Error creating candidate' });
  }
});

router.get('/', async (req, res) => {
  const { electionName } = req.query;
  console.log(`Fetching candidates for election: ${electionName}`);

  try {
    if (!electionName) {
      return res.status(400).json({ message: 'Election name query parameter is required' });
    }

    // Case-sensitive exact match for election title
    const foundElection = await Election.findOne({ title: electionName });

    if (!foundElection) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Find candidates linked to that election
    const candidates = await Candidate.find({ election_id: foundElection._id })
      .populate({
        path: 'election_id',
        select: 'title description location_id start_time end_time',
        populate: {
          path: 'location_id',
          select: 'name'
        }
      }
    );

    res.json(candidates);
  } catch (error) {
    console.error('Error fetching candidates by election name:', error);
    res.status(500).json({ message: 'Error fetching candidates' });
  }
});


// GET /candidates
router.get('/', async (req, res) => {
  try {
    const candidates = await Candidate.find()
      .populate({
        path: 'election_id',
        select: 'title description location_id start_time end_time',
        populate: {
          path: 'location_id',
          select: 'name' // Include only name, or remove to get full document
        }
      });

    res.json(candidates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching candidates' });
  }
});


module.exports = router;
