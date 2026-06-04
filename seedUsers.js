require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/user");

// SECURITY: Use environment variables for passwords
const DEFAULT_PASSWORD = process.env.DEFAULT_USER_PASSWORD || "ChangeMe@2026";

const users = [
  {
    name: "Manager Maganjo",
    username: "manager",
    email: "manager@kgl.co.ug",
    password: DEFAULT_PASSWORD,
    role: "manager",
    branch: "Maganjo",  
    contact: "+256701234567",
  },
  {
    name: "Manager Matugga",
    username: "manager2",
    email: "manager2@kgl.co.ug",
    password: DEFAULT_PASSWORD,
    role: "manager",
    branch: "Matugga",
    contact: "+256702345678",
  },
  {
    name: "Sales Agent Maganjo",
    username: "agent",
    email: "agent@kgl.co.ug",
    password: DEFAULT_PASSWORD,
    role: "agent",
    branch: "Maganjo",
    contact: "+256703456789",
  },
  {
    name: "KGL Director",
    username: "director",
    email: "director@kgl.co.ug",
    password: DEFAULT_PASSWORD,
    role: "director",
    branch: "Maganjo",
    contact: "+256704567890",
  },
];

async function seedUsers() {
  try {
    await mongoose.connect(process.env.DATABASE_URI);
    console.log("MongoDB connected");

    // Clear existing users
    await User.deleteMany({});
    console.log("Cleared existing users");

    // Create new users
    for (const userData of users) {
      const user = await User.create(userData);
      console.log(`✅ Created: ${user.username} (${user.role})`);
    }

    console.log("\n🎉 Demo users created successfully!");
    console.log("\nLogin credentials:");
    console.log("==================");
    console.log("⚠️  SECURITY WARNING: Change default passwords immediately!");
    console.log(`Default password for all users: ${DEFAULT_PASSWORD}`);
    console.log("\nUsers created:");
    users.forEach((u) => {
      console.log(`${u.role.toUpperCase()} (${u.branch}): ${u.username}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error seeding users:", error);
    process.exit(1);
  }
}

seedUsers();