// This script creates a manager user in the database. Run it with `node create-admin.js`.
require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    await connectDB();

    const email = 'brocharles001@gmail.com';
    const exists = await User.findOne({ email });
    if (exists) {
      console.log('Manager already exists:', email);
      process.exit(0);
    }

    const hashed = await bcrypt.hash('App@Groceries2026', 10);

    const user = await User.create({
      name: 'Charles Jada',
      email,
      password: hashed,
      role: 'manager'
    });

    console.log('Manager created:', user.email);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
