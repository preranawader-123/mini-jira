const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },

    // Allow assigning to multiple users
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    status: { type: String, enum: ["To Do", "In Progress", "Done"], default: "To Do" },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    dueDate: { type: Date },
  },
  { timestamps: true, collection: "tasks" }
);

module.exports = mongoose.model("Task", taskSchema);
