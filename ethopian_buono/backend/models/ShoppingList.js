const mongoose = require('mongoose');

const shoppingListSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mealPlanData: {
    dietType: String,
    goal: String,
    days: Number
  },
  items: [{
    ingredient: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true,
      enum: ['Vegetables', 'Proteins', 'Spices', 'Legumes', 'Grains', 'Dairy', 'Other']
    },
    checked: {
      type: Boolean,
      default: false
    }
  }],
  generatedDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ShoppingList', shoppingListSchema);
