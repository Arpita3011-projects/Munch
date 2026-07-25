/**
 * Seed script: Inserts menu items into the database.
 *
 * Usage:
 *   node src/seeds/seedMenu.js
 *
 * This script connects to MongoDB, clears existing menu items,
 * inserts the seed data, and disconnects.
 */

const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem');
const config = require('../config');
const menuItems = require('./menuData');

const seed = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log(`[Seed] Connected to MongoDB: ${config.mongodbUri}`);

    await MenuItem.deleteMany({});
    console.log('[Seed] Cleared existing menu items');

    const inserted = await MenuItem.insertMany(menuItems);
    console.log(`[Seed] Inserted ${inserted.length} menu items`);

    await mongoose.disconnect();
    console.log('[Seed] Disconnected. Done.');
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Failed:', err.message);
    process.exit(1);
  }
};

seed();

