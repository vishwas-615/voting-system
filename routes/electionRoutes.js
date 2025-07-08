const express = require('express');
const router = express.Router();
const Election = require('../models/Election');
const Location = require('../models/Location');

// POST /elections
router.post('/', async (req, res) => {
  try {
    const { title, description, location, start_time, end_time } = req.body;

    const locationDoc = await Location.findOne({ name: location });
    if (!locationDoc) return res.status(404).json({ message: 'Location not found' });

    const election = new Election({
      title,
      description,
      location_id: locationDoc._id,
      start_time,
      end_time
    });

    await election.save();
    res.status(201).json(election);
  } catch (err) {
    res.status(500).json({ message: 'Error creating election' });
  }
});

// GET /elections
router.get('/', async (req, res) => {
  const elections = await Election.find().populate('location_id', 'name');
  res.json(elections);
});

module.exports = router;
