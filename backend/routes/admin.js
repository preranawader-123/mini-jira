const router = require("express").Router();
const User = require("../models/User");
const Task = require("../models/Task");
const Project = require("../models/Project");
const { auth, requireRole } = require("../middleware/authMiddleware");

// ✅ Admin dashboard counts
router.get("/dashboard", auth, requireRole("admin"), async (req, res) => {
  try {
    const employees = await User.countDocuments({ role: "employee" });
    const projects = await Project.countDocuments({});
    const tasks = await Task.countDocuments({});

    const todo = await Task.countDocuments({ status: "To Do" });
    const inProgress = await Task.countDocuments({ status: "In Progress" });
    const done = await Task.countDocuments({ status: "Done" });

    res.json({
      employees,
      projects,
      tasks,
      status: { todo, inProgress, done },
    });
  } catch (e) {
    res.status(500).json({ message: "Failed to load dashboard" });
  }
});

module.exports = router;
