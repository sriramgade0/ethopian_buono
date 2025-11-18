const mongoose = require('mongoose');

const userTDEESchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  age: {
    type: Number,
    required: true,
    min: 1,
    max: 120
  },
  height: {
    type: Number,
    required: true,
    min: 50,  // in cm
    max: 300
  },
  weight: {
    type: Number,
    required: true,
    min: 20,  // in kg
    max: 500
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female']
  },
  activityMode: {
    type: String,
    required: true,
    enum: ['sedentary', 'light', 'moderate', 'active', 'very-active']
  },
  calculatedTDEE: {
    type: Number,
    required: true
  },
  bmr: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('UserTDEE', userTDEESchema);
