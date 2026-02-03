const router = require("express").Router();
const Activity = require("../models/Activity");
const { auth, requireRole } = require("../middleware/authMiddleware");

// Admin inbox = latest activity across ALL tasks
// GET /api/inbox/admin
router.get("/admin", auth, requireRole("admin"), async (req, res) => {
  try {
    // ✅ prevent caching
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");

    const items = await Activity.find()
      .populate("actor", "name email role")
      .populate("task", "title status priority")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Failed to load inbox" });
  }
});

module.exports = router;
