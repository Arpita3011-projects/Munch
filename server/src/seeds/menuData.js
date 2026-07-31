/**
 * Seed data for 20 realistic menu items.
 * Uses placeholder images from picsum.photos for consistent aspect ratios.
 */
const menuItems = [
  // ─── Milkshakes (5) ──────────────────────────────────────────────
  {
    name: 'Classic Vanilla Milkshake',
    description: 'Rich and creamy vanilla milkshake made with real ice cream and fresh milk. A timeless favourite.',
    price: 6.99,
    category: 'Milkshakes',
    tags: ['popular', 'classic'],
    image: 'https://picsum.photos/seed/milkshake1/400/300',
    isAvailable: true,
    sizes: [
      { name: 'Regular (12 oz)', priceAdjustment: 0 },
      { name: 'Large (16 oz)', priceAdjustment: 2.00 },
      { name: 'Extra Large (22 oz)', priceAdjustment: 3.50 },
    ],
    addOns: [
      { name: 'Whipped cream', price: 0.50 },
      { name: 'Extra syrup shot', price: 0.75 },
      { name: 'Chocolate drizzle', price: 0.50 },
    ],
  },
  {
    name: 'Chocolate Fudge Milkshake',
    description: 'Indulgent chocolate milkshake blended with fudge sauce, chocolate ice cream, and whipped cream.',
    price: 7.99,
    category: 'Milkshakes',
    tags: ['popular', 'chocolate'],
    image: 'https://picsum.photos/seed/milkshake2/400/300',
    isAvailable: true,
    sizes: [
      { name: 'Regular (12 oz)', priceAdjustment: 0 },
      { name: 'Large (16 oz)', priceAdjustment: 2.00 },
      { name: 'Extra Large (22 oz)', priceAdjustment: 3.50 },
    ],
    addOns: [
      { name: 'Whipped cream', price: 0.50 },
      { name: 'Extra fudge', price: 1.00 },
      { name: 'Brownie chunk', price: 1.50 },
    ],
  },
  {
    name: 'Strawberry Dream Milkshake',
    description: 'Fresh strawberry milkshake made with real strawberries, strawberry ice cream, and a hint of vanilla.',
    price: 7.49,
    category: 'Milkshakes',
    tags: ['seasonal', 'fruit'],
    image: 'https://picsum.photos/seed/milkshake3/400/300',
    isAvailable: true,
    sizes: [
      { name: 'Regular (12 oz)', priceAdjustment: 0 },
      { name: 'Large (16 oz)', priceAdjustment: 2.00 },
      { name: 'Extra Large (22 oz)', priceAdjustment: 3.50 },
    ],
    addOns: [
      { name: 'Whipped cream', price: 0.50 },
      { name: 'Fresh berries', price: 1.25 },
      { name: 'Honey drizzle', price: 0.50 },
    ],
  },
  {
    name: 'Cookies & Cream Milkshake',
    description: 'Crushed chocolate cookie pieces blended into creamy vanilla ice cream, topped with cookie crumble.',
    price: 8.49,
    category: 'Milkshakes',
    tags: ['popular', 'cookies'],
    image: 'https://picsum.photos/seed/milkshake4/400/300',
    isAvailable: true,
    sizes: [
      { name: 'Regular (12 oz)', priceAdjustment: 0 },
      { name: 'Large (16 oz)', priceAdjustment: 2.00 },
      { name: 'Extra Large (22 oz)', priceAdjustment: 3.50 },
    ],
    addOns: [
      { name: 'Whipped cream', price: 0.50 },
      { name: 'Extra cookie crumble', price: 0.75 },
      { name: 'Chocolate sauce', price: 0.50 },
    ],
  },
  {
    name: 'Salted Caramel Milkshake',
    description: 'Sweet and salty caramel milkshake with house-made caramel sauce and a pinch of sea salt.',
    price: 8.49,
    category: 'Milkshakes',
    tags: ['signature'],
    image: 'https://picsum.photos/seed/milkshake5/400/300',
    isAvailable: true,
    sizes: [
      { name: 'Regular (12 oz)', priceAdjustment: 0 },
      { name: 'Large (16 oz)', priceAdjustment: 2.00 },
      { name: 'Extra Large (22 oz)', priceAdjustment: 3.50 },
    ],
    addOns: [
      { name: 'Whipped cream', price: 0.50 },
      { name: 'Extra caramel', price: 0.75 },
      { name: 'Sea salt sprinkle', price: 0.25 },
    ],
  },

  // ─── Sundaes (5) ────────────────────────────────────────────────
  {
    name: 'Brownie Explosion Sundae',
    description: 'Warm chocolate brownie topped with vanilla ice cream, hot fudge, whipped cream, and a cherry.',
    price: 9.99,
    category: 'Sundaes',
    tags: ['popular', 'chocolate', 'indulgent'],
    image: 'https://picsum.photos/seed/sundae1/400/300',
    isAvailable: true,
    sizes: [
      { name: 'Single Scoop', priceAdjustment: 0 },
      { name: 'Double Scoop', priceAdjustment: 2.50 },
    ],
    addOns: [
      { name: 'Extra brownie', price: 2.00 },
      { name: 'Hot fudge', price: 1.00 },
      { name: 'Chopped nuts', price: 0.75 },
      { name: 'Cherry', price: 0.50 },
    ],
  },
  {
    name: 'Berrylicious Sundae',
    description: 'Mixed berry compote over vanilla ice cream with fresh berries, granola, and honey drizzle.',
    price: 8.99,
    category: 'Sundaes',
    tags: ['fruit', 'seasonal'],
    image: 'https://picsum.photos/seed/sundae2/400/300',
    isAvailable: true,
    sizes: [
      { name: 'Single Scoop', priceAdjustment: 0 },
      { name: 'Double Scoop', priceAdjustment: 2.50 },
    ],
    addOns: [
      { name: 'Extra berries', price: 1.50 },
      { name: 'Granola', price: 0.75 },
      { name: 'Honey drizzle', price: 0.50 },
    ],
  },
  {
    name: 'Banana Split Sundae',
    description: 'Classic banana split with three scoops of ice cream, pineapple, strawberry, and chocolate toppings.',
    price: 10.49,
    category: 'Sundaes',
    tags: ['classic', 'popular'],
    image: 'https://picsum.photos/seed/sundae3/400/300',
    isAvailable: true,
    sizes: [
      { name: 'Regular', priceAdjustment: 0 },
      { name: 'Large', priceAdjustment: 2.00 },
    ],
    addOns: [
      { name: 'Extra banana', price: 0.75 },
      { name: 'Hot fudge', price: 1.00 },
      { name: 'Whipped cream', price: 0.50 },
    ],
  },
  {
    name: 'Caramel Pecan Sundae',
    description: 'Buttery pecan ice cream drizzled with warm caramel sauce, toasted pecans, and whipped cream.',
    price: 9.49,
    category: 'Sundaes',
    tags: ['signature', 'nutty'],
    image: 'https://picsum.photos/seed/sundae4/400/300',
    isAvailable: true,
    sizes: [
      { name: 'Single Scoop', priceAdjustment: 0 },
      { name: 'Double Scoop', priceAdjustment: 2.50 },
    ],
    addOns: [
      { name: 'Extra pecans', price: 1.25 },
      { name: 'Caramel drizzle', price: 0.75 },
      { name: 'Whipped cream', price: 0.50 },
    ],
  },
  {
    name: 'Mint Chocolate Chip Sundae',
    description: 'Refreshing mint ice cream with chocolate chips, hot fudge, and a dollop of whipped cream.',
    price: 8.99,
    category: 'Sundaes',
    tags: ['refreshing', 'chocolate'],
    image: 'https://picsum.photos/seed/sundae5/400/300',
    isAvailable: true,
    sizes: [
      { name: 'Single Scoop', priceAdjustment: 0 },
      { name: 'Double Scoop', priceAdjustment: 2.50 },
    ],
    addOns: [
      { name: 'Hot fudge', price: 1.00 },
      { name: 'Extra chocolate chips', price: 0.75 },
      { name: 'Whipped cream', price: 0.50 },
    ],
  },

  // ─── Ice Cream (5) ──────────────────────────────────────────────
  {
    name: 'Vanilla Bean Ice Cream',
    description: 'Creamy vanilla bean ice cream made with real Madagascar vanilla. Simple and perfect.',
    price: 4.99,
    category: 'Ice Cream',
    tags: ['classic', 'popular'],
    image: 'https://picsum.photos/seed/icecream1/400/300',
    isAvailable: true,
    sizes: [
      { name: 'Single Scoop', priceAdjustment: 0 },
      { name: 'Double Scoop', priceAdjustment: 2.00 },
      { name: 'Triple Scoop', priceAdjustment: 3.50 },
    ],
    addOns: [
      { name: 'Waffle cone', price: 0.75 },
      { name: 'Sprinkles', price: 0.50 },
      { name: 'Chocolate dip', price: 1.00 },
    ],
  },
  {
    name: 'Belgian Chocolate Ice Cream',
    description: 'Deep, rich Belgian chocolate ice cream crafted with premium cocoa for the ultimate chocolate experience.',
    price: 5.49,
    category: 'Ice Cream',
    tags: ['chocolate', 'premium'],
    image: 'https://picsum.photos/seed/icecream2/400/300',
    isAvailable: true,
    sizes: [
      { name: 'Single Scoop', priceAdjustment: 0 },
      { name: 'Double Scoop', priceAdjustment: 2.00 },
      { name: 'Triple Scoop', priceAdjustment: 3.50 },
    ],
    addOns: [
      { name: 'Waffle cone', price: 0.75 },
      { name: 'Chocolate shavings', price: 0.75 },
      { name: 'Whipped cream', price: 0.50 },
    ],
  },
  {
    name: 'Mango Sorbet',
    description: 'Dairy-free mango sorbet bursting with tropical fruit flavour. A refreshing dairy-free option.',
    price: 5.49,
    category: 'Ice Cream',
    tags: ['vegan', 'fruit', 'refreshing'],
    image: 'https://picsum.photos/seed/icecream3/400/300',
    isAvailable: true,
    sizes: [
      { name: 'Single Scoop', priceAdjustment: 0 },
      { name: 'Double Scoop', priceAdjustment: 2.00 },
      { name: 'Triple Scoop', priceAdjustment: 3.50 },
    ],
    addOns: [
      { name: 'Fresh mango chunks', price: 1.00 },
      { name: 'Coconut flakes', price: 0.75 },
    ],
  },
  {
    name: 'Pistachio Gelato',
    description: 'Authentic Italian-style pistachio gelato with real pistachio pieces. Smooth and nutty.',
    price: 5.99,
    category: 'Ice Cream',
    tags: ['premium', 'nutty'],
    image: 'https://picsum.photos/seed/icecream4/400/300',
    isAvailable: true,
    sizes: [
      { name: 'Single Scoop', priceAdjustment: 0 },
      { name: 'Double Scoop', priceAdjustment: 2.00 },
      { name: 'Triple Scoop', priceAdjustment: 3.50 },
    ],
    addOns: [
      { name: 'Waffle cone', price: 0.75 },
      { name: 'Chopped pistachios', price: 1.00 },
      { name: 'Honey drizzle', price: 0.50 },
    ],
  },
  {
    name: 'Cookies & Cream Ice Cream',
    description: 'Creamy vanilla ice cream packed with generous chunks of chocolate sandwich cookies.',
    price: 4.99,
    category: 'Ice Cream',
    tags: ['popular', 'cookies'],
    image: 'https://picsum.photos/seed/icecream5/400/300',
    isAvailable: true,
    sizes: [
      { name: 'Single Scoop', priceAdjustment: 0 },
      { name: 'Double Scoop', priceAdjustment: 2.00 },
      { name: 'Triple Scoop', priceAdjustment: 3.50 },
    ],
    addOns: [
      { name: 'Waffle cone', price: 0.75 },
      { name: 'Extra cookie pieces', price: 0.75 },
      { name: 'Chocolate sauce', price: 0.50 },
    ],
  },

  // ─── Cookie Dough (3) ────────────────────────────────────────────
  {
    name: 'Classic Chocolate Chip Cookie Dough',
    description: 'Our signature chocolate chip cookie dough, ready to bake or enjoy raw (safe-to-eat).',
    price: 6.99,
    category: 'Cookie Dough',
    tags: ['popular', 'classic'],
    image: 'https://picsum.photos/seed/cookie1/400/300',
    isAvailable: true,
    sizes: [
      { name: 'Quarter lb', priceAdjustment: 0 },
      { name: 'Half lb', priceAdjustment: 3.00 },
      { name: 'One lb', priceAdjustment: 5.50 },
    ],
    addOns: [
      { name: 'Ice cream on the side', price: 2.50 },
      { name: 'Chocolate dip', price: 1.00 },
    ],
  },
  {
    name: 'Double Chocolate Cookie Dough',
    description: 'Rich chocolate cookie dough loaded with dark and milk chocolate chunks for double the indulgence.',
    price: 7.49,
    category: 'Cookie Dough',
    tags: ['chocolate', 'indulgent'],
    image: 'https://picsum.photos/seed/cookie2/400/300',
    isAvailable: true,
    sizes: [
      { name: 'Quarter lb', priceAdjustment: 0 },
      { name: 'Half lb', priceAdjustment: 3.00 },
      { name: 'One lb', priceAdjustment: 5.50 },
    ],
    addOns: [
      { name: 'Ice cream on the side', price: 2.50 },
      { name: 'Extra chocolate chunks', price: 1.00 },
    ],
  },
  {
    name: 'Peanut Butter Bliss Cookie Dough',
    description: 'Creamy peanut butter cookie dough with peanut butter chips and milk chocolate chunks.',
    price: 7.49,
    category: 'Cookie Dough',
    tags: ['signature', 'nutty'],
    image: 'https://picsum.photos/seed/cookie3/400/300',
    isAvailable: true,
    sizes: [
      { name: 'Quarter lb', priceAdjustment: 0 },
      { name: 'Half lb', priceAdjustment: 3.00 },
      { name: 'One lb', priceAdjustment: 5.50 },
    ],
    addOns: [
      { name: 'Ice cream on the side', price: 2.50 },
      { name: 'Peanut butter drizzle', price: 0.75 },
    ],
  },

  // ─── Coffee (2) ──────────────────────────────────────────────────
  {
    name: 'Iced Caramel Latte',
    description: 'Smooth espresso over ice with creamy milk and house-made caramel syrup.',
    price: 5.49,
    category: 'Coffee',
    tags: ['popular', 'coffee'],
    image: 'https://picsum.photos/seed/coffee1/400/300',
    isAvailable: true,
    sizes: [
      { name: 'Small (12 oz)', priceAdjustment: 0 },
      { name: 'Medium (16 oz)', priceAdjustment: 1.00 },
      { name: 'Large (20 oz)', priceAdjustment: 2.00 },
    ],
    addOns: [
      { name: 'Extra espresso shot', price: 0.75 },
      { name: 'Almond milk', price: 0.50 },
      { name: 'Oat milk', price: 0.75 },
      { name: 'Whipped cream', price: 0.50 },
    ],
  },
  {
    name: 'Mocha Frappé',
    description: 'Blended chocolate and coffee frappé topped with whipped cream and chocolate drizzle.',
    price: 6.49,
    category: 'Coffee',
    tags: ['popular', 'chocolate', 'coffee'],
    image: 'https://picsum.photos/seed/coffee2/400/300',
    isAvailable: true,
    sizes: [
      { name: 'Small (12 oz)', priceAdjustment: 0 },
      { name: 'Medium (16 oz)', priceAdjustment: 1.00 },
      { name: 'Large (20 oz)', priceAdjustment: 2.00 },
    ],
    addOns: [
      { name: 'Extra espresso shot', price: 0.75 },
      { name: 'Whipped cream', price: 0.50 },
      { name: 'Chocolate drizzle', price: 0.50 },
    ],
  },
];

module.exports = menuItems;

