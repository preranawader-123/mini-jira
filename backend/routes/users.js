const router = require("express").Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { auth, requireRole } = require("../middleware/authMiddleware");

// ✅ Admin: get all users
router.get("/", auth, requireRole("admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: "Failed to load users" });
  }
});

// ✅ Admin: create employee/admin
router.post("/", auth, requireRole("admin"), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, password required" });
    }

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      role: role === "admin" ? "admin" : "employee",
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (e) {
    res.status(500).json({ message: "Failed to create user" });
  }
});

// ✅ Admin: delete user
router.delete("/:id", auth, requireRole("admin"), async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (e) {
    res.status(500).json({ message: "Failed to delete user" });
  }
});

module.exports = router;
