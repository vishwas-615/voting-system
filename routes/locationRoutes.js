const express = require('express');
const router = express.Router();
const Location = require('../models/Location');

// Create location
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    const exists = await Location.findOne({ name });
    if (exists) return res.status(400).json({ message: 'Location already exists' });

    const location = new Location({ name });
    await location.save();
    res.status(201).json(location);
  } catch (error) {
    res.status(500).json({ message: 'Error creating location' });
  }
});

// Get all locations
router.get('/', async (req, res) => {
  try {
    const locations = await Location.find().sort({ name: 1 });
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching locations' });
  }
});

module.exports = router;
