const express = require('express');
const router = express.Router();
const UserTDEE = require('../models/UserTDEE');
const { authenticateToken } = require('./auth');

// Activity multipliers for TDEE calculation
const activityMultipliers = {
  'sedentary': 1.2,        // Little or no exercise
  'light': 1.375,          // Light exercise 1-3 days/week
  'moderate': 1.55,        // Moderate exercise 3-5 days/week
  'active': 1.725,         // Heavy exercise 6-7 days/week
  'very-active': 1.9       // Very heavy exercise, physical job
};

// Calculate BMR using Mifflin-St Jeor Equation
function calculateBMR(weight, height, age, gender) {
  if (gender === 'male') {
    return (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    return (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
}

// Calculate TDEE (Total Daily Energy Expenditure)
function calculateTDEE(bmr, activityMode) {
  const multiplier = activityMultipliers[activityMode] || 1.2;
  return Math.round(bmr * multiplier);
}

// Save or update user TDEE details
router.post('/save', authenticateToken, async (req, res) => {
  try {
    const { age, height, weight, gender, activityMode } = req.body;
    const userId = req.userId;

    // Validate input
    if (!age || !height || !weight || !gender || !activityMode) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Calculate BMR and TDEE
    const bmr = calculateBMR(weight, height, age, gender);
    const calculatedTDEE = calculateTDEE(bmr, activityMode);

    // Check if user already has TDEE data
    let userTDEE = await UserTDEE.findOne({ userId });

    if (userTDEE) {
      // Update existing TDEE data
      userTDEE.age = age;
      userTDEE.height = height;
      userTDEE.weight = weight;
      userTDEE.gender = gender;
      userTDEE.activityMode = activityMode;
      userTDEE.bmr = bmr;
      userTDEE.calculatedTDEE = calculatedTDEE;
      await userTDEE.save();
    } else {
      // Create new TDEE data
      userTDEE = new UserTDEE({
        userId,
        age,
        height,
        weight,
        gender,
        activityMode,
        bmr,
        calculatedTDEE
      });
      await userTDEE.save();
    }

    res.json({
      message: 'TDEE data saved successfully',
      tdee: {
        age: userTDEE.age,
        height: userTDEE.height,
        weight: userTDEE.weight,
        gender: userTDEE.gender,
        activityMode: userTDEE.activityMode,
        bmr: userTDEE.bmr,
        calculatedTDEE: userTDEE.calculatedTDEE
      }
    });
  } catch (error) {
    console.error('Save TDEE error:', error);
    res.status(500).json({ error: 'Server error while saving TDEE data' });
  }
});

// Get user's TDEE details
router.get('/details', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;

    const userTDEE = await UserTDEE.findOne({ userId });

    if (!userTDEE) {
      return res.status(404).json({ error: 'TDEE data not found for this user' });
    }

    res.json({
      tdee: {
        age: userTDEE.age,
        height: userTDEE.height,
        weight: userTDEE.weight,
        gender: userTDEE.gender,
        activityMode: userTDEE.activityMode,
        bmr: userTDEE.bmr,
        calculatedTDEE: userTDEE.calculatedTDEE,
        createdAt: userTDEE.createdAt,
        updatedAt: userTDEE.updatedAt
      }
    });
  } catch (error) {
    console.error('Get TDEE error:', error);
    res.status(500).json({ error: 'Server error while fetching TDEE data' });
  }
});

// Calculate TDEE without saving (for preview)
router.post('/calculate', async (req, res) => {
  try {
    const { age, height, weight, gender, activityMode } = req.body;

    // Validate input
    if (!age || !height || !weight || !gender || !activityMode) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Calculate BMR and TDEE
    const bmr = calculateBMR(weight, height, age, gender);
    const calculatedTDEE = calculateTDEE(bmr, activityMode);

    res.json({
      bmr: Math.round(bmr),
      calculatedTDEE
    });
  } catch (error) {
    console.error('Calculate TDEE error:', error);
    res.status(500).json({ error: 'Server error while calculating TDEE' });
  }
});

module.exports = router;
