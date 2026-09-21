// ============================================================
// CLEANCRAVE CURATED FOOD CATALOG
// ============================================================
//
// Nutrition values are curated reference values per 100 g.
// They are used for the curated recommendation catalog so that
// an incomplete or mismatched USDA record cannot overwrite a
// food with 0/blank nutrition.
//
// USDA is still used for food identification/details/images when
// a reliable match exists.
// ============================================================

const FOOD_CATALOG = [
  // ==========================================
  // VEGETARIAN
  // ==========================================
  {
    name: "Paneer",
    search: "paneer",
    category: "Vegetarian",
    preference: "Vegetarian",
    price: 100,
    imageQuery: "paneer Indian food",
    nutrition: { calories: 265, protein: 18.3, carbohydrates: 6.1, fat: 20.8, fiber: 2.0, sugar: 3.6, sodium: 22 },
  },

  // ==========================================
  // INDIAN
  // ==========================================
  {
    name: "Paneer Tikka",
    search: "paneer tikka",
    category: "Indian",
    preference: "Vegetarian",
    price: 120,
    imageQuery: "paneer tikka Indian food",
    nutrition: { calories: 220, protein: 15, carbohydrates: 8, fat: 15, fiber: 1.5, sugar: 3, sodium: 450 },
  },

  {
    name: "Dal",
    search: "lentils cooked",
    category: "Indian",
    preference: "Vegetarian",
    price: 50,
    imageQuery: "dal Indian food",
    nutrition: { calories: 116, protein: 9, carbohydrates: 20.1, fat: 0.4, fiber: 7.9, sugar: 1.8, sodium: 2 },
  },

  {
    name: "Rajma",
    search: "kidney beans cooked",
    category: "Indian",
    preference: "Vegetarian",
    price: 60,
    imageQuery: "rajma Indian food",
    nutrition: { calories: 127, protein: 8.7, carbohydrates: 22.8, fat: 0.5, fiber: 6.4, sugar: 0.3, sodium: 2 },
  },

  {
    name: "Chole",
    search: "chickpeas cooked",
    category: "Indian",
    preference: "Vegetarian",
    price: 60,
    imageQuery: "chole Indian food",
    nutrition: { calories: 164, protein: 8.9, carbohydrates: 27.4, fat: 2.6, fiber: 7.6, sugar: 4.8, sodium: 7 },
  },

  {
    name: "Roti",
    search: "whole wheat roti chapati",
    category: "Indian",
    preference: "Vegetarian",
    price: 30,
    imageQuery: "roti Indian food",
    nutrition: { calories: 297, protein: 11.3, carbohydrates: 55.7, fat: 4.2, fiber: 11.0, sugar: 2.5, sodium: 400 },
  },

  {
    name: "Poha",
    search: "poha flattened rice",
    category: "Indian",
    preference: "Vegetarian",
    price: 40,
    imageQuery: "poha Indian food",
    nutrition: { calories: 130, protein: 2.9, carbohydrates: 27.9, fat: 1.5, fiber: 2.5, sugar: 0.5, sodium: 250 },
  },

  {
    name: "Idli",
    search: "idli rice cake",
    category: "Indian",
    preference: "Vegetarian",
    price: 40,
    imageQuery: "idli Indian food",
    nutrition: { calories: 146, protein: 4.5, carbohydrates: 30.0, fat: 0.7, fiber: 1.5, sugar: 0.8, sodium: 250 },
  },

  {
    name: "Dosa",
    search: "plain dosa",
    category: "Indian",
    preference: "Vegetarian",
    price: 50,
    imageQuery: "plain dosa Indian food",
    nutrition: { calories: 168, protein: 3.9, carbohydrates: 29.0, fat: 3.7, fiber: 1.5, sugar: 1.0, sodium: 250 },
  },

  {
    name: "Upma",
    search: "vegetable upma",
    category: "Indian",
    preference: "Vegetarian",
    price: 50,
    imageQuery: "upma Indian food",
    nutrition: { calories: 150, protein: 3.5, carbohydrates: 25, fat: 4, fiber: 2, sugar: 2, sodium: 300 },
  },

  {
    name: "Khichdi",
    search: "moong dal khichdi",
    category: "Indian",
    preference: "Vegetarian",
    price: 60,
    imageQuery: "khichdi Indian food",
    nutrition: { calories: 120, protein: 4.5, carbohydrates: 20, fat: 2.5, fiber: 3, sugar: 1.5, sodium: 250 },
  },

  {
    name: "Vegetable Pulao",
    search: "vegetable pulao",
    category: "Indian",
    preference: "Vegetarian",
    price: 70,
    imageQuery: "vegetable pulao Indian food",
    nutrition: { calories: 150, protein: 3.5, carbohydrates: 25, fat: 4, fiber: 2.5, sugar: 3, sodium: 300 },
  },

  {
    name: "Besan Chilla",
    search: "besan chickpea pancake",
    category: "Indian",
    preference: "Vegetarian",
    price: 60,
    imageQuery: "besan chilla Indian food",
    nutrition: { calories: 180, protein: 8, carbohydrates: 24, fat: 6, fiber: 4, sugar: 3, sodium: 300 },
  },

  {
    name: "Egg Bhurji",
    search: "egg bhurji",
    category: "Indian",
    preference: "Eggitarian",
    price: 60,
    imageQuery: "egg bhurji Indian food",
    nutrition: { calories: 180, protein: 11, carbohydrates: 5, fat: 12, fiber: 1, sugar: 2, sodium: 400 },
  },

  {
    name: "Egg Curry",
    search: "egg curry",
    category: "Indian",
    preference: "Eggitarian",
    price: 80,
    imageQuery: "egg curry Indian food",
    nutrition: { calories: 160, protein: 9, carbohydrates: 7, fat: 10, fiber: 1, sugar: 3, sodium: 450 },
  },

  {
    name: "Chicken Biryani",
    search: "chicken biryani",
    category: "Indian",
    preference: "Non-Vegetarian",
    price: 160,
    imageQuery: "chicken biryani Indian food",
    nutrition: { calories: 180, protein: 10, carbohydrates: 20, fat: 6, fiber: 1, sugar: 2, sodium: 450 },
  },

  // ==========================================
  // GRAINS
  // ==========================================
  {
    name: "Rice",
    search: "white rice cooked",
    category: "Grains",
    preference: "Vegetarian",
    price: 40,
    imageQuery: "cooked rice food",
    nutrition: { calories: 130, protein: 2.7, carbohydrates: 28.2, fat: 0.3, fiber: 0.4, sugar: 0.1, sodium: 1 },
  },

  {
    name: "Brown Rice",
    search: "brown rice cooked",
    category: "Grains",
    preference: "Vegetarian",
    price: 55,
    imageQuery: "brown rice food",
    nutrition: { calories: 123, protein: 2.7, carbohydrates: 25.6, fat: 1.0, fiber: 1.6, sugar: 0.2, sodium: 1 },
  },

  {
    name: "Quinoa",
    search: "quinoa cooked",
    category: "Grains",
    preference: "Vegan",
    price: 100,
    imageQuery: "cooked quinoa food",
    nutrition: { calories: 120, protein: 4.4, carbohydrates: 21.3, fat: 1.9, fiber: 2.8, sugar: 0.9, sodium: 7 },
  },

  // ==========================================
  // DAIRY
  // ==========================================
  {
    name: "Curd",
    search: "plain yogurt",
    category: "Dairy",
    preference: "Vegetarian",
    price: 40,
    imageQuery: "plain curd yogurt food",
    nutrition: { calories: 61, protein: 3.5, carbohydrates: 4.7, fat: 3.3, fiber: 0, sugar: 4.7, sodium: 46 },
  },

  {
    name: "Cottage Cheese",
    search: "cottage cheese",
    category: "Dairy",
    preference: "Vegetarian",
    price: 80,
    imageQuery: "cottage cheese food",
    nutrition: { calories: 98, protein: 11.1, carbohydrates: 3.4, fat: 4.3, fiber: 0, sugar: 2.7, sodium: 364 },
  },

  {
    name: "Greek Yogurt",
    search: "greek yogurt plain",
    category: "Dairy",
    preference: "Vegetarian",
    price: 80,
    imageQuery: "greek yogurt food",
    nutrition: { calories: 73, protein: 9.9, carbohydrates: 3.9, fat: 2.0, fiber: 0, sugar: 3.6, sodium: 36 },
  },

  {
    name: "Milk",
    search: "whole milk",
    category: "Dairy",
    preference: "Vegetarian",
    price: 30,
    imageQuery: "glass of milk food",
    nutrition: { calories: 61, protein: 3.2, carbohydrates: 4.8, fat: 3.3, fiber: 0, sugar: 5.1, sodium: 43 },
  },

  // ==========================================
  // LEGUMES
  // ==========================================
  {
    name: "Sprouts",
    search: "mung bean sprouts",
    category: "Legumes",
    preference: "Vegan",
    price: 50,
    imageQuery: "sprouts food",
    nutrition: { calories: 30, protein: 3, carbohydrates: 6, fat: 0.2, fiber: 1.8, sugar: 4, sodium: 6 },
  },

  {
    name: "Chickpeas",
    search: "chickpeas cooked",
    category: "Legumes",
    preference: "Vegan",
    price: 60,
    imageQuery: "chickpeas food",
    nutrition: { calories: 164, protein: 8.9, carbohydrates: 27.4, fat: 2.6, fiber: 7.6, sugar: 4.8, sodium: 7 },
  },

  {
    name: "Lentils",
    search: "lentils cooked",
    category: "Legumes",
    preference: "Vegan",
    price: 50,
    imageQuery: "lentils food",
    nutrition: { calories: 116, protein: 9, carbohydrates: 20.1, fat: 0.4, fiber: 7.9, sugar: 1.8, sodium: 2 },
  },

  // ==========================================
  // PLANT PROTEIN
  // ==========================================
  {
    name: "Tofu",
    search: "tofu raw firm",
    category: "Plant Protein",
    preference: "Vegan",
    price: 80,
    imageQuery: "tofu food",
    nutrition: { calories: 144, protein: 17.3, carbohydrates: 2.8, fat: 8.7, fiber: 2.3, sugar: 0.6, sodium: 14 },
  },

  {
    name: "Soybeans",
    search: "soybeans cooked",
    category: "Plant Protein",
    preference: "Vegan",
    price: 90,
    imageQuery: "cooked soybeans food",
    nutrition: { calories: 173, protein: 16.6, carbohydrates: 9.9, fat: 9, fiber: 6, sugar: 3, sodium: 1 },
  },

  // ==========================================
  // BREAKFAST
  // ==========================================
  {
    name: "Oats",
    search: "oats raw",
    category: "Breakfast",
    preference: "Vegan",
    price: 70,
    imageQuery: "oatmeal oats food",
    nutrition: { calories: 389, protein: 16.9, carbohydrates: 66.3, fat: 6.9, fiber: 10.6, sugar: 0.9, sodium: 2 },
  },

  // ==========================================
  // VEGETABLES
  // ==========================================
  {
    name: "Sweet Potato",
    search: "sweet potato cooked",
    category: "Vegetables",
    preference: "Vegan",
    price: 50,
    imageQuery: "sweet potato food",
    nutrition: { calories: 76, protein: 1.4, carbohydrates: 17.7, fat: 0.1, fiber: 2.5, sugar: 5.4, sodium: 27 },
  },

  {
    name: "Broccoli",
    search: "broccoli cooked",
    category: "Vegetables",
    preference: "Vegan",
    price: 50,
    imageQuery: "broccoli food",
    nutrition: { calories: 35, protein: 2.4, carbohydrates: 7.2, fat: 0.4, fiber: 3.3, sugar: 1.4, sodium: 41 },
  },

  {
    name: "Spinach",
    search: "spinach cooked",
    category: "Vegetables",
    preference: "Vegan",
    price: 40,
    imageQuery: "spinach food",
    nutrition: { calories: 23, protein: 2.9, carbohydrates: 3.8, fat: 0.4, fiber: 2.4, sugar: 0.4, sodium: 70 },
  },

  {
    name: "Carrot",
    search: "carrot raw",
    category: "Vegetables",
    preference: "Vegan",
    price: 30,
    imageQuery: "fresh carrot food",
    nutrition: { calories: 41, protein: 0.9, carbohydrates: 9.6, fat: 0.2, fiber: 2.8, sugar: 4.7, sodium: 69 },
  },

  {
    name: "Cucumber",
    search: "cucumber raw",
    category: "Vegetables",
    preference: "Vegan",
    price: 30,
    imageQuery: "fresh cucumber food",
    nutrition: { calories: 15, protein: 0.7, carbohydrates: 3.6, fat: 0.1, fiber: 0.5, sugar: 1.7, sodium: 2 },
  },

  {
    name: "Tomato",
    search: "tomato raw",
    category: "Vegetables",
    preference: "Vegan",
    price: 30,
    imageQuery: "fresh tomato food",
    nutrition: { calories: 18, protein: 0.9, carbohydrates: 3.9, fat: 0.2, fiber: 1.2, sugar: 2.6, sodium: 5 },
  },

  {
    name: "Potato",
    search: "potato boiled",
    category: "Vegetables",
    preference: "Vegan",
    price: 30,
    imageQuery: "boiled potato food",
    nutrition: { calories: 87, protein: 1.9, carbohydrates: 20.1, fat: 0.1, fiber: 1.8, sugar: 0.9, sodium: 4 },
  },

  {
    name: "Green Peas",
    search: "green peas cooked",
    category: "Vegetables",
    preference: "Vegan",
    price: 50,
    imageQuery: "green peas food",
    nutrition: { calories: 84, protein: 5.4, carbohydrates: 15.6, fat: 0.2, fiber: 5.5, sugar: 5.9, sodium: 286 },
  },

  {
    name: "Mushrooms",
    search: "mushrooms cooked",
    category: "Vegetables",
    preference: "Vegan",
    price: 60,
    imageQuery: "cooked mushrooms food",
    nutrition: { calories: 28, protein: 3.6, carbohydrates: 5.3, fat: 0.5, fiber: 2.2, sugar: 2.0, sodium: 5 },
  },

  {
    name: "Corn",
    search: "sweet corn cooked",
    category: "Vegetables",
    preference: "Vegan",
    price: 50,
    imageQuery: "sweet corn food",
    nutrition: { calories: 96, protein: 3.4, carbohydrates: 21, fat: 1.5, fiber: 2.4, sugar: 4.5, sodium: 1 },
  },

  // ==========================================
  // EGG
  // ==========================================
  {
    name: "Boiled Egg",
    search: "egg whole boiled",
    category: "Egg",
    preference: "Eggitarian",
    price: 20,
    imageQuery: "boiled egg food",
    nutrition: { calories: 155, protein: 12.6, carbohydrates: 1.1, fat: 10.6, fiber: 0, sugar: 1.1, sodium: 124 },
  },

  {
    name: "Egg Omelette",
    search: "egg omelet",
    category: "Egg",
    preference: "Eggitarian",
    price: 50,
    imageQuery: "egg omelette food",
    nutrition: { calories: 154, protein: 10.6, carbohydrates: 0.6, fat: 11.7, fiber: 0, sugar: 0.4, sodium: 330 },
  },

  {
    name: "Scrambled Eggs",
    search: "scrambled eggs",
    category: "Egg",
    preference: "Eggitarian",
    price: 50,
    imageQuery: "scrambled eggs food",
    nutrition: { calories: 149, protein: 10, carbohydrates: 1.6, fat: 10.3, fiber: 0, sugar: 1.0, sodium: 350 },
  },

  {
    name: "Egg White",
    search: "egg white cooked",
    category: "Egg",
    preference: "Eggitarian",
    price: 15,
    imageQuery: "egg white food",
    nutrition: { calories: 52, protein: 10.9, carbohydrates: 0.7, fat: 0.2, fiber: 0, sugar: 0.7, sodium: 166 },
  },

  // ==========================================
  // CHICKEN
  // ==========================================
  {
    name: "Chicken Breast",
    search: "chicken breast cooked",
    category: "Chicken",
    preference: "Non-Vegetarian",
    price: 120,
    imageQuery: "grilled chicken breast food",
    nutrition: { calories: 165, protein: 31, carbohydrates: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74 },
  },

  {
    name: "Chicken Tikka",
    search: "chicken tikka",
    category: "Chicken",
    preference: "Non-Vegetarian",
    price: 150,
    imageQuery: "chicken tikka Indian food",
    nutrition: { calories: 180, protein: 27, carbohydrates: 4, fat: 6, fiber: 0.5, sugar: 1, sodium: 500 },
  },

  {
    name: "Chicken Curry",
    search: "chicken curry",
    category: "Chicken",
    preference: "Non-Vegetarian",
    price: 140,
    imageQuery: "chicken curry Indian food",
    nutrition: { calories: 170, protein: 16, carbohydrates: 6, fat: 9, fiber: 1, sugar: 2, sodium: 450 },
  },

  {
    name: "Grilled Chicken",
    search: "grilled chicken breast",
    category: "Chicken",
    preference: "Non-Vegetarian",
    price: 150,
    imageQuery: "grilled chicken food",
    nutrition: { calories: 165, protein: 31, carbohydrates: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74 },
  },

  // ==========================================
  // FISH
  // ==========================================
  {
    name: "Fish",
    search: "white fish cooked",
    category: "Fish",
    preference: "Non-Vegetarian",
    price: 140,
    imageQuery: "grilled fish food",
    nutrition: { calories: 128, protein: 26, carbohydrates: 0, fat: 2.7, fiber: 0, sugar: 0, sodium: 60 },
  },

  {
    name: "Salmon",
    search: "salmon cooked",
    category: "Fish",
    preference: "Non-Vegetarian",
    price: 180,
    imageQuery: "grilled salmon food",
    nutrition: { calories: 206, protein: 22.1, carbohydrates: 0, fat: 12.4, fiber: 0, sugar: 0, sodium: 59 },
  },

  {
    name: "Tuna",
    search: "tuna cooked",
    category: "Fish",
    preference: "Non-Vegetarian",
    price: 170,
    imageQuery: "tuna fish food",
    nutrition: { calories: 132, protein: 28, carbohydrates: 0, fat: 1.3, fiber: 0, sugar: 0, sodium: 47 },
  },

  // ==========================================
  // SEAFOOD
  // ==========================================
  {
    name: "Prawns",
    search: "shrimp cooked",
    category: "Seafood",
    preference: "Non-Vegetarian",
    price: 180,
    imageQuery: "prawn shrimp food",
    nutrition: { calories: 99, protein: 24, carbohydrates: 0.2, fat: 0.3, fiber: 0, sugar: 0, sodium: 111 },
  },

  // ==========================================
  // MEAT
  // ==========================================
  {
    name: "Mutton",
    search: "mutton cooked",
    category: "Meat",
    preference: "Non-Vegetarian",
    price: 180,
    imageQuery: "mutton curry food",
    nutrition: { calories: 234, protein: 25, carbohydrates: 0, fat: 14, fiber: 0, sugar: 0, sodium: 70 },
  },

  {
    name: "Turkey Breast",
    search: "turkey breast cooked",
    category: "Meat",
    preference: "Non-Vegetarian",
    price: 160,
    imageQuery: "turkey breast food",
    nutrition: { calories: 135, protein: 29, carbohydrates: 0, fat: 1.8, fiber: 0, sugar: 0, sodium: 46 },
  },

  // ==========================================
  // FRUIT
  // ==========================================
  {
    name: "Apple",
    search: "apple raw",
    category: "Fruit",
    preference: "Vegan",
    price: 40,
    imageQuery: "fresh apple fruit",
    nutrition: { calories: 52, protein: 0.3, carbohydrates: 13.8, fat: 0.2, fiber: 2.4, sugar: 10.4, sodium: 1 },
  },

  {
    name: "Banana",
    search: "banana raw",
    category: "Fruit",
    preference: "Vegan",
    price: 20,
    imageQuery: "fresh banana fruit",
    nutrition: { calories: 89, protein: 1.1, carbohydrates: 22.8, fat: 0.3, fiber: 2.6, sugar: 12.2, sodium: 1 },
  },

  {
    name: "Guava",
    search: "guava raw",
    category: "Fruit",
    preference: "Vegan",
    price: 40,
    imageQuery: "fresh guava fruit",
    nutrition: { calories: 68, protein: 2.6, carbohydrates: 14.3, fat: 1.0, fiber: 5.4, sugar: 8.9, sodium: 2 },
  },

  {
    name: "Orange",
    search: "orange raw",
    category: "Fruit",
    preference: "Vegan",
    price: 30,
    imageQuery: "fresh orange fruit",
    nutrition: { calories: 47, protein: 0.9, carbohydrates: 11.8, fat: 0.1, fiber: 2.4, sugar: 9.4, sodium: 0 },
  },

  {
    name: "Mango",
    search: "mango raw",
    category: "Fruit",
    preference: "Vegan",
    price: 50,
    imageQuery: "fresh mango fruit",
    nutrition: { calories: 60, protein: 0.8, carbohydrates: 15, fat: 0.4, fiber: 1.6, sugar: 13.7, sodium: 1 },
  },

  {
    name: "Papaya",
    search: "papaya raw",
    category: "Fruit",
    preference: "Vegan",
    price: 40,
    imageQuery: "fresh papaya fruit",
    nutrition: { calories: 43, protein: 0.5, carbohydrates: 10.8, fat: 0.3, fiber: 1.7, sugar: 7.8, sodium: 8 },
  },

  {
    name: "Watermelon",
    search: "watermelon raw",
    category: "Fruit",
    preference: "Vegan",
    price: 30,
    imageQuery: "fresh watermelon fruit",
    nutrition: { calories: 30, protein: 0.6, carbohydrates: 7.6, fat: 0.2, fiber: 0.4, sugar: 6.2, sodium: 1 },
  },

  {
    name: "Pineapple",
    search: "pineapple raw",
    category: "Fruit",
    preference: "Vegan",
    price: 40,
    imageQuery: "fresh pineapple fruit",
    nutrition: { calories: 50, protein: 0.5, carbohydrates: 13.1, fat: 0.1, fiber: 1.4, sugar: 9.9, sodium: 1 },
  },

  {
    name: "Pomegranate",
    search: "pomegranate raw",
    category: "Fruit",
    preference: "Vegan",
    price: 70,
    imageQuery: "pomegranate fruit",
    nutrition: { calories: 83, protein: 1.7, carbohydrates: 18.7, fat: 1.2, fiber: 4.0, sugar: 13.7, sodium: 3 },
  },

  {
    name: "Grapes",
    search: "grapes raw",
    category: "Fruit",
    preference: "Vegan",
    price: 50,
    imageQuery: "fresh grapes fruit",
    nutrition: { calories: 69, protein: 0.7, carbohydrates: 18.1, fat: 0.2, fiber: 0.9, sugar: 15.5, sodium: 2 },
  },

  {
    name: "Kiwi",
    search: "kiwifruit raw",
    category: "Fruit",
    preference: "Vegan",
    price: 70,
    imageQuery: "fresh kiwi fruit",
    nutrition: { calories: 61, protein: 1.1, carbohydrates: 14.7, fat: 0.5, fiber: 3.0, sugar: 9.0, sodium: 3 },
  },

  {
    name: "Strawberries",
    search: "strawberries raw",
    category: "Fruit",
    preference: "Vegan",
    price: 60,
    imageQuery: "fresh strawberries fruit",
    nutrition: { calories: 32, protein: 0.7, carbohydrates: 7.7, fat: 0.3, fiber: 2.0, sugar: 4.9, sodium: 1 },
  },

  // ==========================================
  // HEALTHY FATS
  // ==========================================
  {
    name: "Peanut Butter",
    search: "peanut butter",
    category: "Healthy Fats",
    preference: "Vegan",
    price: 90,
    imageQuery: "peanut butter food",
    nutrition: { calories: 588, protein: 25.1, carbohydrates: 20.0, fat: 50.4, fiber: 6.0, sugar: 9.2, sodium: 17 },
  },

  // ==========================================
  // NUTS
  // ==========================================
  {
    name: "Almonds",
    search: "almonds raw",
    category: "Nuts",
    preference: "Vegan",
    price: 100,
    imageQuery: "almonds food",
    nutrition: { calories: 579, protein: 21.2, carbohydrates: 21.6, fat: 49.9, fiber: 12.5, sugar: 4.4, sodium: 1 },
  },

  {
    name: "Walnuts",
    search: "walnuts raw",
    category: "Nuts",
    preference: "Vegan",
    price: 120,
    imageQuery: "walnuts food",
    nutrition: { calories: 654, protein: 15.2, carbohydrates: 13.7, fat: 65.2, fiber: 6.7, sugar: 2.6, sodium: 2 },
  },

  {
    name: "Cashews",
    search: "cashews raw",
    category: "Nuts",
    preference: "Vegan",
    price: 110,
    imageQuery: "cashews food",
    nutrition: { calories: 553, protein: 18.2, carbohydrates: 30.2, fat: 43.9, fiber: 3.3, sugar: 5.9, sodium: 12 },
  },

  {
    name: "Peanuts",
    search: "peanuts raw",
    category: "Nuts",
    preference: "Vegan",
    price: 80,
    imageQuery: "peanuts food",
    nutrition: { calories: 567, protein: 25.8, carbohydrates: 16.1, fat: 49.2, fiber: 8.5, sugar: 4.0, sodium: 18 },
  },

  // ==========================================
  // SEEDS
  // ==========================================
  {
    name: "Chia Seeds",
    search: "chia seeds",
    category: "Seeds",
    preference: "Vegan",
    price: 120,
    imageQuery: "chia seeds food",
    nutrition: { calories: 486, protein: 16.5, carbohydrates: 42.1, fat: 30.7, fiber: 34.4, sugar: 0, sodium: 16 },
  },

  {
    name: "Flax Seeds",
    search: "flax seeds",
    category: "Seeds",
    preference: "Vegan",
    price: 100,
    imageQuery: "flax seeds food",
    nutrition: { calories: 534, protein: 18.3, carbohydrates: 28.9, fat: 42.2, fiber: 27.3, sugar: 1.6, sodium: 30 },
  },

  {
    name: "Pumpkin Seeds",
    search: "pumpkin seeds",
    category: "Seeds",
    preference: "Vegan",
    price: 120,
    imageQuery: "pumpkin seeds food",
    nutrition: { calories: 559, protein: 30.2, carbohydrates: 10.7, fat: 49.1, fiber: 6.0, sugar: 1.4, sodium: 7 },
  },

];

module.exports = FOOD_CATALOG;