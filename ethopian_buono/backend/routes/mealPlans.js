const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');

// Generate meal plan based on preferences
router.post('/generate', async (req, res) => {
  try {
    const { dietType, goal, days = 7 } = req.body;
    
    let filter = {};
    if (dietType) {
      filter.dietType = dietType; // 'veg' or 'non-veg'
    }
    if (goal) {
      filter.goal = goal; // 'muscle-gain' or 'weight-loss'
    }

    const recipes = await Recipe.find(filter);
    
    // Group recipes by meal type
    const groupedRecipes = {
      breakfast: recipes.filter(recipe => recipe.mealType === 'breakfast'),
      lunch: recipes.filter(recipe => recipe.mealType === 'lunch'),
      dinner: recipes.filter(recipe => recipe.mealType === 'dinner'),
      snack: recipes.filter(recipe => recipe.mealType === 'snack')
    };

    // Generate meal plan for specified number of days
    const mealPlan = [];
    for (let day = 0; day < days; day++) {
      const dayPlan = {
        day: day + 1,
        meals: {}
      };

      // Select one recipe from each meal type for the day
      for (const mealType in groupedRecipes) {
        if (groupedRecipes[mealType].length > 0) {
          const randomIndex = Math.floor(Math.random() * groupedRecipes[mealType].length);
          dayPlan.meals[mealType] = groupedRecipes[mealType][randomIndex];
        }
      }

      mealPlan.push(dayPlan);
    }

    res.json({ mealPlan });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;