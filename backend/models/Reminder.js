const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    note: { type: String, default: "" },

    remindAt: { type: Date, required: true },

    // owner of reminder
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // status
    isDone: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reminder", reminderSchema);
