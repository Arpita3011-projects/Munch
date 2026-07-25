const mongoose = require('mongoose');
const config = require('./index');

const connectDB = async () => {
  const conn = await mongoose.connect(config.mongodbUri);
  console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`);
};

module.exports = { connectDB };
