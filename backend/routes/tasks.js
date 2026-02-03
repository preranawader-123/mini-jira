const router = require("express").Router();
const Task = require("../models/Task");
const User = require("../models/User");
const Activity = require("../models/Activity");
const { auth, requireRole } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const isAssignee = (task, userId) => {
  return (task.assignedTo || []).some((id) => String(id) === String(userId));
};

const populateTask = (taskId) => {
  return Task.findById(taskId)
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role")
    .populate("comments.user", "name email role")
    .populate("attachments.uploadedBy", "name email role");
};

// ✅ ADMIN: create task (multi assign)
// POST /api/tasks
router.post("/", auth, requireRole("admin"), async (req, res) => {
  try {
    const { title, description, assignedTo, priority, dueDate } = req.body;

    if (!title || !assignedTo || !Array.isArray(assignedTo) || assignedTo.length === 0) {
      return res.status(400).json({ message: "title and assignedTo[] required" });
    }

    const users = await User.find({ _id: { $in: assignedTo } });
    if (!users.length) return res.status(400).json({ message: "Assigned users not found" });

    const task = await Task.create({
      title: title.trim(),
      description: description || "",
      assignedTo,
      createdBy: req.user._id,
      priority: priority || "Medium",
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    const populated = await populateTask(task._id);
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ ADMIN: view all tasks
// GET /api/tasks
router.get("/", auth, requireRole("admin"), async (req, res) => {
  const tasks = await Task.find()
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role")
    .populate("comments.user", "name email role")
    .populate("attachments.uploadedBy", "name email role")
    .sort({ createdAt: -1 });

  res.json(tasks);
});

// ✅ My tasks (admin/employee) where I'm included
// GET /api/tasks/my
router.get("/my", auth, async (req, res) => {
  const tasks = await Task.find({ assignedTo: { $in: [req.user._id] } })
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role")
    .populate("comments.user", "name email role")
    .populate("attachments.uploadedBy", "name email role")
    .sort({ createdAt: -1 });

  res.json(tasks);
});

// ✅ Update status (admin OR assignee)
// PATCH /api/tasks/:id/status
router.patch("/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["To Do", "In Progress", "Done"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const allowed = req.user.role === "admin" || isAssignee(task, req.user._id);
    if (!allowed) return res.status(403).json({ message: "Forbidden" });

    task.status = status;
    await task.save();

    await Activity.create({
      type: "status",
      task: task._id,
      actor: req.user._id,
      message: `Status changed to "${status}"`,
    });

    const populated = await populateTask(task._id);
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Add comment (admin OR assignee)
// POST /api/tasks/:id/comments
router.post("/:id/comments", auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "text required" });

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const allowed = req.user.role === "admin" || isAssignee(task, req.user._id);
    if (!allowed) return res.status(403).json({ message: "Forbidden" });

    task.comments.push({ text, user: req.user._id });

    // ✅ get new comment id BEFORE save completes
    const newComment = task.comments[task.comments.length - 1];

    await task.save();

    // ✅ activity includes commentId
    await Activity.create({
      type: "comment",
      task: task._id,
      actor: req.user._id,
      message: text,
      commentId: newComment._id,
    });

    const populated = await populateTask(task._id);
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ EDIT comment (admin OR owner)
// PATCH /api/tasks/:taskId/comments/:commentId
router.patch("/:taskId/comments/:commentId", auth, async (req, res) => {
  try {
    const { taskId, commentId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) return res.status(400).json({ message: "text required" });

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const comment = (task.comments || []).id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const isAdmin = req.user.role === "admin";
    const isOwner = String(comment.user) === String(req.user._id);
    if (!isAdmin && !isOwner) return res.status(403).json({ message: "Forbidden" });

    comment.text = text.trim();
    await task.save();

    // ✅ update inbox activity too
    await Activity.findOneAndUpdate(
      { type: "comment", task: taskId, commentId },
      { message: text.trim() }
    );

    const populated = await populateTask(task._id);
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ DELETE comment (admin OR owner)
// DELETE /api/tasks/:taskId/comments/:commentId
router.delete("/:taskId/comments/:commentId", auth, async (req, res) => {
  try {
    const { taskId, commentId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const comment = (task.comments || []).id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const isAdmin = req.user.role === "admin";
    const isOwner = String(comment.user) === String(req.user._id);
    if (!isAdmin && !isOwner) return res.status(403).json({ message: "Forbidden" });

    comment.deleteOne();
    await task.save();

    // ✅ remove the comment activity from inbox
    await Activity.deleteMany({ type: "comment", task: taskId, commentId });

    const populated = await populateTask(task._id);
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Upload files (admin OR assignee)
// POST /api/tasks/:id/files   (multipart form-data, field "files")
router.post("/:id/files", auth, upload.array("files", 10), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const allowed = req.user.role === "admin" || isAssignee(task, req.user._id);
    if (!allowed) return res.status(403).json({ message: "Forbidden" });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    req.files.forEach((f) => {
      task.attachments.push({
        filename: f.filename,
        originalname: f.originalname,
        mimetype: f.mimetype,
        uploadedBy: req.user._id,
      });
    });

    await task.save();

    for (const f of req.files) {
      await Activity.create({
        type: "file",
        task: task._id,
        actor: req.user._id,
        message: "File attached",
        file: {
          filename: f.filename,
          originalname: f.originalname,
          mimetype: f.mimetype,
        },
      });
    }

    const populated = await populateTask(task._id);
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message || "Upload failed" });
  }
});

// ✅ ADMIN: delete task
// DELETE /api/tasks/:id
router.delete("/:id", auth, requireRole("admin"), async (req, res) => {
  const deleted = await Task.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Task not found" });
  res.json({ message: "Task deleted" });
});

module.exports = router;
