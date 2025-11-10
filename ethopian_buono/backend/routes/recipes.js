const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');

// Get all recipes
router.get('/', async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get recipes by dietary preference
router.get('/filter', async (req, res) => {
  try {
    const { dietType, goal } = req.query;
    let filter = {};

    if (dietType) {
      filter.dietType = dietType; // 'veg' or 'non-veg'
    }

    if (goal) {
      filter.goal = goal; // 'muscle-gain' or 'weight-loss'
    }

    const recipes = await Recipe.find(filter);
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;