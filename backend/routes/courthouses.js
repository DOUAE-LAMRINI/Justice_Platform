
const express = require('express');
const Courthouse = require('../models/Courthouse');
const router = express.Router();

// Get all courthouses with filters
router.get('/', async (req, res) => {
  try {
    const { search, type, city } = req.query;
    const query = {};
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (type && type !== 'all') {
      query.type = type;
    }
    if (city && city !== 'all') {
      query.city = city;
    }

    const courthouses = await Courthouse.find(query);
    res.json(courthouses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single courthouse
router.get('/:id', async (req, res) => {
  try {
    const courthouse = await Courthouse.findById(req.params.id);
    if (!courthouse) {
      return res.status(404).json({ message: 'Courthouse not found' });
    }
    res.json(courthouse);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;