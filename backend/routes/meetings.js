const router = require("express").Router();
const Meeting = require("../models/Meeting");
const { auth } = require("../middleware/authMiddleware");

// ✅ Create meeting (Admin only)
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can create meetings" });
    }

    const { title, agenda, startTime, endTime, attendees, location, meetingLink } = req.body;

    if (!title || !startTime || !endTime) {
      return res.status(400).json({ message: "title, startTime, endTime are required" });
    }

    const meeting = await Meeting.create({
      title: title.trim(),
      agenda: agenda || "",
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      attendees: Array.isArray(attendees) ? attendees : [],
      location: location || "",
      meetingLink: meetingLink || "",
      createdBy: req.user._id
    });

    const populated = await Meeting.findById(meeting._id)
      .populate("createdBy", "name email role")
      .populate("attendees", "name email role");

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to create meeting" });
  }
});

// ✅ Get meetings
// - Admin: sees all meetings
// - Employee: sees meetings where they are attendee
router.get("/", auth, async (req, res) => {
  try {
    const filter =
      req.user.role === "admin"
        ? {}
        : { attendees: { $in: [req.user._id] } };

    const meetings = await Meeting.find(filter)
      .populate("createdBy", "name email role")
      .populate("attendees", "name email role")
      .sort({ startTime: 1 });

    res.json(meetings);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to load meetings" });
  }
});

// ✅ Delete meeting (Admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can delete meetings" });
    }

    const deleted = await Meeting.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Meeting not found" });

    res.json({ message: "Meeting deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to delete meeting" });
  }
});

module.exports = router;
