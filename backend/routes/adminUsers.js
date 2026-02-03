const router = require("express").Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// ✅ Works with either middleware style:
// 1) module.exports = { authMiddleware, isAdmin }
// 2) module.exports = { auth, requireRole }
const mw = require("../middleware/authMiddleware");

const authFn = mw.authMiddleware || mw.auth;
if (!authFn) {
  throw new Error("auth middleware not found in authMiddleware.js exports");
}

const adminGuard =
  mw.isAdmin ||
  (mw.requireRole ? mw.requireRole("admin") : null) ||
  ((req, res, next) => {
    if (req.user?.role === "admin") return next();
    return res.status(403).json({ message: "Admin only" });
  });

router.get("/employees", authFn, adminGuard, async (req, res) => {
  try {
    const employees = await User.find({ role: "employee" })
      .select("_id name email role createdAt")
      .sort({ createdAt: -1 });

    res.json(employees);
  } catch (e) {
    res.status(500).json({ message: "Failed to load employees" });
  }
});

router.put("/:id", authFn, adminGuard, async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "name and email are required" });
    }

    const existing = await User.findOne({ email, _id: { $ne: req.params.id } });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { name: name.trim(), email: email.trim() },
      { new: true }
    ).select("_id name email role createdAt");

    if (!updated) return res.status(404).json({ message: "User not found" });

    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: "Failed to update employee" });
  }
});

router.put("/:id/password", authFn, adminGuard, async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (e) {
    res.status(500).json({ message: "Failed to update password" });
  }
});

module.exports = router;
