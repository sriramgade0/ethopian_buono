const express = require('express');
const router = express.Router();
const ShoppingList = require('../models/ShoppingList');
const Recipe = require('../models/Recipe');
const { authenticateToken } = require('./auth');

// Ingredient categorization mapping
const ingredientCategories = {
  // Vegetables
  'onion': 'Vegetables',
  'tomato': 'Vegetables',
  'pepper': 'Vegetables',
  'garlic': 'Vegetables',
  'ginger': 'Vegetables',
  'carrot': 'Vegetables',
  'potato': 'Vegetables',
  'cabbage': 'Vegetables',
  'spinach': 'Vegetables',

  // Proteins
  'chicken': 'Proteins',
  'beef': 'Proteins',
  'lamb': 'Proteins',
  'fish': 'Proteins',
  'egg': 'Proteins',
  'meat': 'Proteins',

  // Spices
  'berbere': 'Spices',
  'cumin': 'Spices',
  'turmeric': 'Spices',
  'cardamom': 'Spices',
  'coriander': 'Spices',
  'fenugreek': 'Spices',
  'black pepper': 'Spices',
  'cinnamon': 'Spices',
  'cloves': 'Spices',
  'paprika': 'Spices',
  'cayenne': 'Spices',
  'salt': 'Spices',

  // Legumes
  'lentil': 'Legumes',
  'chickpea': 'Legumes',
  'split pea': 'Legumes',
  'bean': 'Legumes',

  // Grains
  'flour': 'Grains',
  'teff': 'Grains',
  'wheat': 'Grains',
  'barley': 'Grains',
  'rice': 'Grains',

  // Dairy
  'butter': 'Dairy',
  'milk': 'Dairy',
  'yogurt': 'Dairy',
  'cheese': 'Dairy',

  // Oils
  'oil': 'Other',
  'ghee': 'Other'
};

// Function to categorize an ingredient
function categorizeIngredient(ingredient) {
  const lowerIngredient = ingredient.toLowerCase();

  for (const [key, category] of Object.entries(ingredientCategories)) {
    if (lowerIngredient.includes(key)) {
      return category;
    }
  }

  return 'Other';
}

// Generate shopping list from meal plan
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { mealPlan, dietType, goal, days } = req.body;
    const userId = req.userId;

    if (!mealPlan || !Array.isArray(mealPlan)) {
      return res.status(400).json({ error: 'Valid meal plan is required' });
    }

    // Collect all ingredients from all meals
    const allIngredients = [];

    for (const day of mealPlan) {
      const meals = day.meals;

      for (const mealType in meals) {
        const meal = meals[mealType];
        if (meal && meal.ingredients && Array.isArray(meal.ingredients)) {
          meal.ingredients.forEach(ingredient => {
            allIngredients.push(ingredient);
          });
        }
      }
    }

    // Remove duplicates and categorize
    const uniqueIngredients = [...new Set(allIngredients)];

    const categorizedItems = uniqueIngredients.map(ingredient => ({
      ingredient: ingredient,
      category: categorizeIngredient(ingredient),
      checked: false
    }));

    // Sort by category
    categorizedItems.sort((a, b) => a.category.localeCompare(b.category));

    // Create shopping list
    const shoppingList = new ShoppingList({
      userId,
      mealPlanData: {
        dietType,
        goal,
        days
      },
      items: categorizedItems
    });

    await shoppingList.save();

    res.json({
      message: 'Shopping list generated successfully',
      shoppingList: {
        id: shoppingList._id,
        items: shoppingList.items,
        generatedDate: shoppingList.generatedDate,
        mealPlanData: shoppingList.mealPlanData
      }
    });
  } catch (error) {
    console.error('Generate shopping list error:', error);
    res.status(500).json({ error: 'Failed to generate shopping list' });
  }
});

// Get user's shopping lists
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;

    const shoppingLists = await ShoppingList.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ shoppingLists });
  } catch (error) {
    console.error('Get shopping lists error:', error);
    res.status(500).json({ error: 'Failed to fetch shopping lists' });
  }
});

// Get specific shopping list
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const shoppingList = await ShoppingList.findOne({ _id: id, userId });

    if (!shoppingList) {
      return res.status(404).json({ error: 'Shopping list not found' });
    }

    res.json({ shoppingList });
  } catch (error) {
    console.error('Get shopping list error:', error);
    res.status(500).json({ error: 'Failed to fetch shopping list' });
  }
});

// Toggle item checked status
router.put('/:id/toggle-item', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { itemId } = req.body;

    const shoppingList = await ShoppingList.findOne({ _id: id, userId });

    if (!shoppingList) {
      return res.status(404).json({ error: 'Shopping list not found' });
    }

    const item = shoppingList.items.id(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    item.checked = !item.checked;
    await shoppingList.save();

    res.json({
      message: 'Item updated successfully',
      shoppingList
    });
  } catch (error) {
    console.error('Toggle item error:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Delete shopping list
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const shoppingList = await ShoppingList.findOneAndDelete({ _id: id, userId });

    if (!shoppingList) {
      return res.status(404).json({ error: 'Shopping list not found' });
    }

    res.json({ message: 'Shopping list deleted successfully' });
  } catch (error) {
    console.error('Delete shopping list error:', error);
    res.status(500).json({ error: 'Failed to delete shopping list' });
  }
});

// Clear checked items
router.put('/:id/clear-checked', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const shoppingList = await ShoppingList.findOne({ _id: id, userId });

    if (!shoppingList) {
      return res.status(404).json({ error: 'Shopping list not found' });
    }

    shoppingList.items = shoppingList.items.filter(item => !item.checked);
    await shoppingList.save();

    res.json({
      message: 'Checked items cleared successfully',
      shoppingList
    });
  } catch (error) {
    console.error('Clear checked items error:', error);
    res.status(500).json({ error: 'Failed to clear checked items' });
  }
});

module.exports = router;
