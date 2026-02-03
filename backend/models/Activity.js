const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["comment", "status", "file"],
      required: true,
    },

    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // ✅ for comments we store message + commentId so we can edit/delete in inbox too
    message: { type: String, default: "" },
    commentId: { type: mongoose.Schema.Types.ObjectId, default: null },

    // ✅ for files
    file: {
      filename: String,
      originalname: String,
      mimetype: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema);
