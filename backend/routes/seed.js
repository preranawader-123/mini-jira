const router = require("express").Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// POST /api/seed/admin
// Creates first admin only if no admin exists.
// Remove/disable after you create your admin.
router.post("/admin", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const alreadyAdmin = await User.findOne({ role: "admin" });
    if (alreadyAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, password required" });
    }

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashed,
      role: "admin",
    });

    res.status(201).json({
      message: "Admin created",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
