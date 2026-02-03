const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const email = "admin@gmail.com";
    const password = "admin123";

    const existing = await User.findOne({ email });
    if (existing) {
      console.log("Admin already exists:", email);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name: "Admin",
      email,
      password: hashedPassword,
      role: "admin",
    });

    console.log("✅ Admin created!");
    console.log("Email:", email);
    console.log("Password:", password);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
