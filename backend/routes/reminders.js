const router = require("express").Router();
const Reminder = require("../models/Reminder");
const { auth } = require("../middleware/authMiddleware");

// ✅ Create reminder (for logged-in user)
router.post("/", auth, async (req, res) => {
  try {
    const { title, note, remindAt } = req.body;

    if (!title || !remindAt) {
      return res.status(400).json({ message: "title and remindAt are required" });
    }

    const reminder = await Reminder.create({
      title: title.trim(),
      note: note || "",
      remindAt: new Date(remindAt),
      user: req.user._id
    });

    res.status(201).json(reminder);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to create reminder" });
  }
});

// ✅ Get reminders (only own)
router.get("/", auth, async (req, res) => {
  try {
    const reminders = await Reminder.find({ user: req.user._id }).sort({ remindAt: 1 });
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to load reminders" });
  }
});

// ✅ Mark done/undone
router.patch("/:id", auth, async (req, res) => {
  try {
    const { isDone, title, note, remindAt } = req.body;

    const reminder = await Reminder.findOne({ _id: req.params.id, user: req.user._id });
    if (!reminder) return res.status(404).json({ message: "Reminder not found" });

    if (typeof isDone === "boolean") reminder.isDone = isDone;
    if (title !== undefined) reminder.title = title.trim();
    if (note !== undefined) reminder.note = note;
    if (remindAt !== undefined) reminder.remindAt = new Date(remindAt);

    await reminder.save();
    res.json(reminder);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to update reminder" });
  }
});

// ✅ Delete reminder
router.delete("/:id", auth, async (req, res) => {
  try {
    const deleted = await Reminder.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!deleted) return res.status(404).json({ message: "Reminder not found" });

    res.json({ message: "Reminder deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to delete reminder" });
  }
});

module.exports = router;
