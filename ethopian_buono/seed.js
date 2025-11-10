const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ethopian_buono', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB', err));

// Recipe model
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
    type: Number,
    required: true
  },
  cookTime: {
    type: Number,
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
    type: Number,
    default: 0
  },
  carbs: {
    type: Number,
    default: 0
  },
  fats: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});

const Recipe = mongoose.model('Recipe', recipeSchema);

// Sample Ethiopian recipes
const sampleRecipes = [
  {
    name: "Injera with Misir Wot",
    description: "Traditional Ethiopian injera bread served with spicy red lentil stew",
    ingredients: [
      "2 cups red lentils",
      "1 onion, chopped",
      "3 cloves garlic, minced",
      "1 inch ginger, minced",
      "2 tbsp berbere spice blend",
      "2 tbsp oil",
      "4 cups vegetable broth",
      "Salt to taste"
    ],
    instructions: [
      "Rinse red lentils until water runs clear",
      "In a large pot, sauté onion, garlic, and ginger until soft",
      "Add berbere spice blend and cook for 1 minute",
      "Add lentils and broth, bring to a boil",
      "Reduce heat and simmer for 30 minutes until lentils are soft",
      "Season with salt and serve with injera"
    ],
    mealType: "dinner",
    dietType: "veg",
    goal: "weight-loss",
    prepTime: 10,
    cookTime: 40,
    servings: 4,
    calories: 280,
    protein: 18,
    carbs: 48,
    fats: 3
  },
  {
    name: "Doro Wot",
    description: "Spicy Ethiopian chicken stew with hard-boiled eggs",
    ingredients: [
      "1 kg chicken, cut into pieces",
      "6 hard-boiled eggs",
      "2 large onions, chopped",
      "4 cloves garlic, minced",
      "1 inch ginger, minced",
      "3 tbsp berbere spice blend",
      "3 tbsp oil",
      "2 tbsp tomato paste",
      "4 cups chicken broth",
      "Salt to taste"
    ],
    instructions: [
      "Heat oil in a large pot and sauté onions until golden",
      "Add garlic, ginger, and tomato paste, cook for 2 minutes",
      "Add berbere spice blend and stir for 1 minute",
      "Add chicken pieces and brown on all sides",
      "Pour in broth, bring to a boil",
      "Add hard-boiled eggs, reduce heat and simmer for 45 minutes",
      "Serve hot with injera"
    ],
    mealType: "dinner",
    dietType: "non-veg",
    goal: "muscle-gain",
    prepTime: 15,
    cookTime: 60,
    servings: 6,
    calories: 450,
    protein: 35,
    carbs: 15,
    fats: 25,
    image: "Doro wot.png"
  },
  {
    name: "Kolo",
    description: "Spiced roasted barley snack",
    ingredients: [
      "2 cups barley",
      "2 tbsp oil",
      "1 tsp cumin",
      "1 tsp paprika",
      "1/2 tsp garlic powder",
      "Salt to taste"
    ],
    instructions: [
      "Heat oil in a large pan",
      "Add barley and roast for 10 minutes",
      "Add all spices and salt",
      "Continue to roast for another 5 minutes",
      "Cool and serve as a snack"
    ],
    mealType: "snack",
    dietType: "veg",
    goal: "weight-loss",
    prepTime: 5,
    cookTime: 15,
    servings: 4,
    calories: 150,
    protein: 4,
    carbs: 28,
    fats: 3
  },
  {
    name: "Chechebsa",
    description: "Ethiopian breakfast dish with injera, berbere, and spices",
    ingredients: [
      "2 cups torn injera pieces",
      "2 tbsp clarified butter (niter kibbeh)",
      "2 tbsp berbere spice blend",
      "1 tsp fenugreek seeds",
      "Salt to taste"
    ],
    instructions: [
      "Heat butter in a pan",
      "Add fenugreek seeds and toast for 1 minute",
      "Add berbere spice and stir",
      "Add injera pieces and toss until well coated",
      "Cook for 5-7 minutes until slightly crispy",
      "Serve as a breakfast dish"
    ],
    mealType: "breakfast",
    dietType: "veg",
    goal: "muscle-gain",
    prepTime: 5,
    cookTime: 10,
    servings: 3,
    calories: 320,
    protein: 8,
    carbs: 55,
    fats: 8
  },
  {
    name: "Shiro",
    description: "Ethiopian ground chickpea or lentil stew",
    ingredients: [
      "1 cup shiro powder (or ground chickpeas)",
      "1 onion, chopped",
      "3 cloves garlic, minced",
      "1 inch ginger, minced",
      "2 tbsp berbere spice blend",
      "2 tbsp oil",
      "3 cups water",
      "Salt to taste"
    ],
    instructions: [
      "Sauté onion, garlic, and ginger until soft",
      "Add shiro powder and berbere, mix well",
      "Gradually add water while stirring to prevent lumps",
      "Simmer for 15-20 minutes until thickened",
      "Season with salt and serve with injera"
    ],
    mealType: "lunch",
    dietType: "veg",
    goal: "weight-loss",
    prepTime: 10,
    cookTime: 25,
    servings: 4,
    calories: 220,
    protein: 12,
    carbs: 32,
    fats: 5
  },
  {
    name: "Tibs",
    description: "Sautéed meat with vegetables, traditional Ethiopian dish",
    ingredients: [
      "500g beef or lamb, sliced thin",
      "2 onions, sliced",
      "2 tomatoes, chopped",
      "1 green bell pepper, sliced",
      "2 tbsp oil",
      "1 tsp cumin",
      "1 tsp paprika",
      "Salt to taste"
    ],
    instructions: [
      "Heat oil in a large pan or wok",
      "Sauté meat until browned",
      "Add onions and cook until soft",
      "Add remaining vegetables and spices",
      "Cook for 10 more minutes",
      "Serve hot with injera or bread"
    ],
    mealType: "lunch",
    dietType: "non-veg",
    goal: "muscle-gain",
    prepTime: 15,
    cookTime: 20,
    servings: 4,
    calories: 380,
    protein: 30,
    carbs: 12,
    fats: 22
  }
];

// Function to seed the database
async function seedDatabase() {
  try {
    // Clear existing recipes
    await Recipe.deleteMany({});
    
    // Insert sample recipes
    await Recipe.insertMany(sampleRecipes);
    
    console.log('Sample recipes added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();