const router = require("express").Router();
const mongoose = require("mongoose");
const { authMiddleware } = require("../middleware/authMiddleware");

router.get("/whoami", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

router.get("/db", async (req, res) => {
  res.json({
    mongooseState: mongoose.connection.readyState, // 0=disconnected 1=connected
    dbName: mongoose.connection?.name || null,
    host: mongoose.connection?.host || null,
  });
});

router.get("/collections", async (req, res) => {
  try {
    const cols = await mongoose.connection.db.listCollections().toArray();
    res.json(cols.map((c) => c.name));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
