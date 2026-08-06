/**
 * Admin bootstrap script.
 *
 * Promotes an existing user to the "admin" role (or creates a new admin user).
 * This is the intended, safe way to grant admin access — there is intentionally
 * NO public API to self-assign the admin role.
 *
 * Usage:
 *   node src/seeds/seedAdmin.js --email=admin@munch.app
 *   node src/seeds/seedAdmin.js --email=admin@munch.app --name="Store Admin" --password="ChangeMe123!"
 *
 * Notes:
 *   - With just --email: promotes the existing account to admin (no password change).
 *   - With --name + --password: also creates the account if it doesn't exist yet.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const mongoose = require('mongoose');
const User = require('../models/User');
const config = require('../config');

function parseArgs(argv) {
  const args = {};
  for (const raw of argv.slice(2)) {
    const match = raw.match(/^--([^=]+)=?(.*)$/);
    if (match) args[match[1]] = match[2] || true;
  }
  return args;
}

async function run() {
  const { email, name, password } = parseArgs(process.argv);

  if (!email) {
    console.error('Usage: node src/seeds/seedAdmin.js --email=user@example.com [--name="Store Admin"] [--password="..."]');
    process.exit(1);
  }

  await mongoose.connect(config.mongodbUri);
  console.log('Connected to MongoDB');

  const normalizedEmail = email.toLowerCase().trim();
  let user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    if (!name || !password) {
      console.error(`User "${normalizedEmail}" not found. Provide --name and --password to create a new admin account.`);
      await mongoose.disconnect();
      process.exit(1);
    }
    user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash: password,
      role: 'admin',
    });
    console.log(`Created new admin account for ${normalizedEmail}`);
  } else {
    if (user.role === 'admin') {
      console.log(`User ${normalizedEmail} is already an admin.`);
      await mongoose.disconnect();
      process.exit(0);
    }
    user.role = 'admin';
    await user.save();
    console.log(`Promoted ${normalizedEmail} to admin.`);
  }

  await mongoose.disconnect();
  console.log('Done.');
}

run().catch((err) => {
  console.error('Failed to seed admin:', err);
  process.exit(1);
});

