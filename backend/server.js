const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const taskRoutes = require("./routes/tasks");
const inboxRoutes = require("./routes/inbox");

// ✅ schedule routes you added before (if you already have them)
const meetingRoutes = require("./routes/meetings");
const reminderRoutes = require("./routes/reminders");

// ✅ NEW admin route
const adminRoutes = require("./routes/admin");

// ✅ projects route (only if you have it)
let projectRoutes = null;
try {
  projectRoutes = require("./routes/projects");
} catch (e) {}

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  const dbName = mongoose.connection?.name || "not-connected";
  res.json({ ok: true, db: dbName });
});

// ✅ APIs
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/inbox", inboxRoutes);

app.use("/api/meetings", meetingRoutes);
app.use("/api/reminders", reminderRoutes);

if (projectRoutes) app.use("/api/projects", projectRoutes);

// ✅ Admin summary route
app.use("/api/admin", adminRoutes);

// ✅ Mongo connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected to:", mongoose.connection.name))
  .catch((err) => console.error("Mongo error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
