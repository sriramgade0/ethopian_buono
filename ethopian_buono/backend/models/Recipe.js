const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  ingredients: [{
    type: String,
    required: true
  }],
  instructions: [{
    type: String,
    required: true
  }],
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true
  },
  dietType: {
    type: String,
    enum: ['veg', 'non-veg'],
    required: true
  },
  goal: {
    type: String,
    enum: ['muscle-gain', 'weight-loss'],
    required: true
  },
  prepTime: {
    type: Number, // in minutes
    required: true
  },
  cookTime: {
    type: Number, // in minutes
    required: true
  },
  servings: {
    type: Number,
    required: true
  },
  calories: {
    type: Number,
    required: true
  },
  protein: {
    type: Number, // in grams
    default: 0
  },
  carbs: {
    type: Number, // in grams
    default: 0
  },
  fats: {
    type: Number, // in grams
    default: 0
  },
  image: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Recipe', recipeSchema);