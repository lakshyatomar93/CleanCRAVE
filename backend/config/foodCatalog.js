const FOOD_CATALOG = [
  // ==========================================
  // VEGETARIAN
  // ==========================================

  {
    name: "Paneer",
    search: "paneer cheese",
    category: "Vegetarian",
    preference: "Vegetarian",
    price: 100,
    imageQuery: "paneer Indian food",
  },

  {
    name: "Paneer Tikka",
    search: "paneer cheese",
    category: "Indian",
    preference: "Vegetarian",
    price: 120,
    imageQuery: "paneer tikka Indian food",
  },

  {
    name: "Dal",
    search: "lentils cooked",
    category: "Indian",
    preference: "Vegetarian",
    price: 50,
    imageQuery: "dal Indian food",
  },

  {
    name: "Rajma",
    search: "kidney beans cooked",
    category: "Indian",
    preference: "Vegetarian",
    price: 60,
    imageQuery: "rajma Indian food",
  },

  {
    name: "Chole",
    search: "chickpeas cooked",
    category: "Indian",
    preference: "Vegetarian",
    price: 60,
    imageQuery: "chole Indian food",
  },

  {
    name: "Rice",
    search: "white rice cooked",
    category: "Grains",
    preference: "Vegetarian",
    price: 40,
    imageQuery: "cooked rice food",
  },

  {
    name: "Brown Rice",
    search: "brown rice cooked",
    category: "Grains",
    preference: "Vegetarian",
    price: 55,
    imageQuery: "brown rice food",
  },

  {
    name: "Roti",
    search: "whole wheat bread",
    category: "Indian",
    preference: "Vegetarian",
    price: 30,
    imageQuery: "roti Indian food",
  },

  {
    name: "Poha",
    search: "rice flakes cooked",
    category: "Indian",
    preference: "Vegetarian",
    price: 40,
    imageQuery: "poha Indian food",
  },

  {
    name: "Idli",
    search: "idli rice cake",
    category: "Indian",
    preference: "Vegetarian",
    price: 40,
    imageQuery: "idli Indian food",
  },


  // ==========================================
  // VEGAN
  // ==========================================

  {
    name: "Tofu",
    search: "tofu",
    category: "Plant Protein",
    preference: "Vegan",
    price: 80,
    imageQuery: "tofu food",
  },

  {
    name: "Oats",
    search: "oats",
    category: "Breakfast",
    preference: "Vegan",
    price: 70,
    imageQuery: "oatmeal oats food",
  },

  {
    name: "Chickpeas",
    search: "chickpeas cooked",
    category: "Legumes",
    preference: "Vegan",
    price: 60,
    imageQuery: "chickpeas food",
  },

  {
    name: "Lentils",
    search: "lentils cooked",
    category: "Legumes",
    preference: "Vegan",
    price: 50,
    imageQuery: "lentils food",
  },

  {
    name: "Sweet Potato",
    search: "sweet potato cooked",
    category: "Vegetables",
    preference: "Vegan",
    price: 50,
    imageQuery: "sweet potato food",
  },

  {
    name: "Broccoli",
    search: "broccoli cooked",
    category: "Vegetables",
    preference: "Vegan",
    price: 50,
    imageQuery: "broccoli food",
  },

  {
    name: "Spinach",
    search: "spinach cooked",
    category: "Vegetables",
    preference: "Vegan",
    price: 40,
    imageQuery: "spinach food",
  },


  // ==========================================
  // EGGITARIAN
  // ==========================================

  {
    name: "Boiled Egg",
    search: "egg whole cooked",
    category: "Egg",
    preference: "Eggitarian",
    price: 20,
    imageQuery: "boiled egg food",
  },

  {
    name: "Egg Omelette",
    search: "egg whole cooked",
    category: "Egg",
    preference: "Eggitarian",
    price: 50,
    imageQuery: "egg omelette food",
  },

  {
    name: "Scrambled Eggs",
    search: "egg whole cooked",
    category: "Egg",
    preference: "Eggitarian",
    price: 50,
    imageQuery: "scrambled eggs food",
  },


  // ==========================================
  // NON-VEGETARIAN
  // ==========================================

  {
    name: "Chicken Breast",
    search: "chicken breast cooked",
    category: "Chicken",
    preference: "Non-Vegetarian",
    price: 120,
    imageQuery: "grilled chicken breast food",
  },

  {
    name: "Chicken Tikka",
    search: "chicken breast cooked",
    category: "Chicken",
    preference: "Non-Vegetarian",
    price: 150,
    imageQuery: "chicken tikka Indian food",
  },

  {
    name: "Chicken Curry",
    search: "chicken cooked",
    category: "Chicken",
    preference: "Non-Vegetarian",
    price: 140,
    imageQuery: "chicken curry Indian food",
  },

  {
    name: "Grilled Chicken",
    search: "chicken breast cooked",
    category: "Chicken",
    preference: "Non-Vegetarian",
    price: 150,
    imageQuery: "grilled chicken food",
  },

  {
    name: "Fish",
    search: "fish cooked",
    category: "Fish",
    preference: "Non-Vegetarian",
    price: 140,
    imageQuery: "grilled fish food",
  },

  {
    name: "Salmon",
    search: "salmon cooked",
    category: "Fish",
    preference: "Non-Vegetarian",
    price: 180,
    imageQuery: "grilled salmon food",
  },

  {
    name: "Prawns",
    search: "shrimp cooked",
    category: "Seafood",
    preference: "Non-Vegetarian",
    price: 180,
    imageQuery: "prawn shrimp food",
  },


  // ==========================================
  // FRUITS
  // ==========================================

  {
    name: "Apple",
    search: "apple raw",
    category: "Fruit",
    preference: "Vegan",
    price: 40,
    imageQuery: "fresh apple fruit",
  },

  {
    name: "Banana",
    search: "banana raw",
    category: "Fruit",
    preference: "Vegan",
    price: 20,
    imageQuery: "fresh banana fruit",
  },

  {
    name: "Guava",
    search: "guava raw",
    category: "Fruit",
    preference: "Vegan",
    price: 40,
    imageQuery: "fresh guava fruit",
  },

  {
    name: "Orange",
    search: "orange raw",
    category: "Fruit",
    preference: "Vegan",
    price: 30,
    imageQuery: "fresh orange fruit",
  },

  {
    name: "Mango",
    search: "mango raw",
    category: "Fruit",
    preference: "Vegan",
    price: 50,
    imageQuery: "fresh mango fruit",
  },

  {
    name: "Papaya",
    search: "papaya raw",
    category: "Fruit",
    preference: "Vegan",
    price: 40,
    imageQuery: "fresh papaya fruit",
  },


  // ==========================================
  // HEALTHY FOODS
  // ==========================================

  {
    name: "Greek Yogurt",
    search: "greek yogurt plain",
    category: "Dairy",
    preference: "Vegetarian",
    price: 80,
    imageQuery: "greek yogurt food",
  },

  {
    name: "Milk",
    search: "whole milk",
    category: "Dairy",
    preference: "Vegetarian",
    price: 30,
    imageQuery: "glass of milk food",
  },

  {
    name: "Peanut Butter",
    search: "peanut butter",
    category: "Healthy Fats",
    preference: "Vegan",
    price: 90,
    imageQuery: "peanut butter food",
  },

  {
    name: "Almonds",
    search: "almonds",
    category: "Nuts",
    preference: "Vegan",
    price: 100,
    imageQuery: "almonds food",
  },
];

module.exports = FOOD_CATALOG;