/* ============================================================
   Recipes — Preset recipes with ingredients for quick adding
   ============================================================ */

export const recipes = [
    {
        id: 'pasta_bolognese',
        name: 'Spaghetti Bolognese',
        emoji: '🍝',
        description: 'Classic Italian pasta with rich meat sauce, herbs, and parmesan.',
        ingredients: [
            { name: 'Spaghetti', category: 'bakery', quantity: '500g', icon: '🍝' },
            { name: 'Ground Beef', category: 'meat', quantity: '400g', icon: '🥩' },
            { name: 'Tomatoes', category: 'vegetables', quantity: '4 large', icon: '🍅' },
            { name: 'Onion', category: 'vegetables', quantity: '1 large', icon: '🧅' },
            { name: 'Garlic', category: 'vegetables', quantity: '4 cloves', icon: '🧄' },
            { name: 'Olive Oil', category: 'other', quantity: '3 tbsp', icon: '🫒' },
            { name: 'Parmesan Cheese', category: 'dairy', quantity: '100g', icon: '🧀' },
            { name: 'Basil', category: 'vegetables', quantity: '1 bunch', icon: '🌿' },
        ]
    },
    {
        id: 'chicken_stir_fry',
        name: 'Chicken Stir Fry',
        emoji: '🥘',
        description: 'Quick and healthy stir fry with crispy veggies and tender chicken.',
        ingredients: [
            { name: 'Chicken Breast', category: 'meat', quantity: '500g', icon: '🍗' },
            { name: 'Bell Peppers', category: 'vegetables', quantity: '2', icon: '🫑' },
            { name: 'Broccoli', category: 'vegetables', quantity: '1 head', icon: '🥦' },
            { name: 'Soy Sauce', category: 'other', quantity: '4 tbsp', icon: '🥫' },
            { name: 'Ginger', category: 'vegetables', quantity: '1 thumb', icon: '🫚' },
            { name: 'Rice', category: 'other', quantity: '300g', icon: '🍚' },
            { name: 'Sesame Oil', category: 'other', quantity: '2 tbsp', icon: '🫗' },
            { name: 'Spring Onions', category: 'vegetables', quantity: '3', icon: '🧅' },
        ]
    },
    {
        id: 'greek_salad',
        name: 'Greek Salad',
        emoji: '🥗',
        description: 'Refreshing Mediterranean salad with feta, olives, and crisp vegetables.',
        ingredients: [
            { name: 'Cucumber', category: 'vegetables', quantity: '1 large', icon: '🥒' },
            { name: 'Tomatoes', category: 'vegetables', quantity: '3 medium', icon: '🍅' },
            { name: 'Red Onion', category: 'vegetables', quantity: '1 small', icon: '🧅' },
            { name: 'Feta Cheese', category: 'dairy', quantity: '200g', icon: '🧀' },
            { name: 'Olives', category: 'other', quantity: '100g', icon: '🫒' },
            { name: 'Olive Oil', category: 'other', quantity: '3 tbsp', icon: '🫒' },
            { name: 'Lemon', category: 'fruits', quantity: '1', icon: '🍋' },
        ]
    },
    {
        id: 'banana_smoothie',
        name: 'Banana Smoothie Bowl',
        emoji: '🍌',
        description: 'Thick, creamy smoothie bowl topped with fresh fruits and granola.',
        ingredients: [
            { name: 'Bananas', category: 'fruits', quantity: '3', icon: '🍌' },
            { name: 'Blueberries', category: 'fruits', quantity: '150g', icon: '🫐' },
            { name: 'Yogurt', category: 'dairy', quantity: '200g', icon: '🥛' },
            { name: 'Honey', category: 'other', quantity: '2 tbsp', icon: '🍯' },
            { name: 'Granola', category: 'snacks', quantity: '100g', icon: '🥣' },
            { name: 'Strawberries', category: 'fruits', quantity: '100g', icon: '🍓' },
        ]
    },
    {
        id: 'pancakes',
        name: 'Fluffy Pancakes',
        emoji: '🥞',
        description: 'Light and fluffy weekend breakfast pancakes with maple syrup.',
        ingredients: [
            { name: 'Flour', category: 'bakery', quantity: '250g', icon: '🌾' },
            { name: 'Eggs', category: 'dairy', quantity: '2', icon: '🥚' },
            { name: 'Milk', category: 'dairy', quantity: '300ml', icon: '🥛' },
            { name: 'Butter', category: 'dairy', quantity: '50g', icon: '🧈' },
            { name: 'Maple Syrup', category: 'other', quantity: '1 bottle', icon: '🍁' },
            { name: 'Blueberries', category: 'fruits', quantity: '100g', icon: '🫐' },
        ]
    },
    {
        id: 'tacos',
        name: 'Beef Tacos',
        emoji: '🌮',
        description: 'Mexican-style beef tacos with fresh salsa and guacamole.',
        ingredients: [
            { name: 'Ground Beef', category: 'meat', quantity: '400g', icon: '🥩' },
            { name: 'Taco Shells', category: 'bakery', quantity: '8 pack', icon: '🌮' },
            { name: 'Avocado', category: 'fruits', quantity: '2', icon: '🥑' },
            { name: 'Tomatoes', category: 'vegetables', quantity: '2', icon: '🍅' },
            { name: 'Onion', category: 'vegetables', quantity: '1', icon: '🧅' },
            { name: 'Lime', category: 'fruits', quantity: '2', icon: '🍋' },
            { name: 'Sour Cream', category: 'dairy', quantity: '200g', icon: '🥛' },
            { name: 'Lettuce', category: 'vegetables', quantity: '1 head', icon: '🥬' },
            { name: 'Cheddar Cheese', category: 'dairy', quantity: '150g', icon: '🧀' },
        ]
    },
];
