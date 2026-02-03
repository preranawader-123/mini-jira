const router = require("express").Router();
const Project = require("../models/Project");
const { auth, requireRole } = require("../middleware/authMiddleware");

// ✅ Admin: get all projects
router.get("/", auth, requireRole("admin"), async (req, res) => {
  const projects = await Project.find()
    .populate("createdBy", "name email role")
    .populate("members", "name email role")
    .sort({ createdAt: -1 });

  res.json(projects);
});

// ✅ Admin: create project
router.post("/", auth, requireRole("admin"), async (req, res) => {
  const { name, description, members } = req.body;
  if (!name) return res.status(400).json({ message: "Project name required" });

  const project = await Project.create({
    name: name.trim(),
    description: description || "",
    members: Array.isArray(members) ? members : [],
    createdBy: req.user._id
  });

  const populated = await Project.findById(project._id)
    .populate("createdBy", "name email role")
    .populate("members", "name email role");

  res.status(201).json(populated);
});

// ✅ Admin: delete project
router.delete("/:id", auth, requireRole("admin"), async (req, res) => {
  const deleted = await Project.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Project not found" });
  res.json({ message: "Project deleted" });
});

module.exports = router;
