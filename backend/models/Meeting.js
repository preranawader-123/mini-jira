const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    agenda: { type: String, default: "" },

    // when meeting happens
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },

    // who created it
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // users invited (employees/admins)
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // optional: location/meeting link
    location: { type: String, default: "" },
    meetingLink: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Meeting", meetingSchema);
