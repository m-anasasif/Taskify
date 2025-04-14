const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

// --- MongoDB Connection ---
mongoose.connect("mongodb+srv://a6525776:11333311@cluster0.ut06w.mongodb.net/taskify")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

// --- User Schema ---
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['admin', 'user'], default: 'user' }
});
const User = mongoose.model("User", userSchema);

// --- Task Schema ---
const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  dueDate: Date,
  status: { type: String, default: "pending" },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});
const Task = mongoose.model("Task", taskSchema);

// --- Auth Routes ---
app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password, role } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashed, role });
  try {
    await user.save();
    res.json({ message: "User created" });
  } catch (err) {
    res.status(400).json({ error: "User already exists" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  const token = jwt.sign({ userId: user._id, role: user.role }, "SECRET");
  res.json({ token, user });
});

app.get("/api/auth/users", async (req, res) => {
  const users = await User.find({ role: 'user' });
  res.json(users);
});

app.get("/api/auth/users/:userId", async (req, res) => {
  const user = await User.findById( req.params.userId );
  res.json(user);
});

// --- Task Routes ---
app.post("/api/tasks", async (req, res) => {
  const { title, description, dueDate, assignedTo } = req.body;
  const task = new Task({ title, description, dueDate, assignedTo });
  await task.save();
  res.json(task);
});

app.get("/api/tasks/:userId", async (req, res) => {
  const tasks = await Task.find({ assignedTo: req?.params?.userId });
  res.json(tasks);
});
app.get("/api/tasks", async (req, res) => {
  const tasks = await Task.find({});
  res.json(tasks);
});

app.patch("/api/tasks/:id", async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(task);
});

// Delete task by ID
app.delete("/api/tasks/:taskId", async (req, res) => {
  const { taskId } = req.params;
  try {
    const deletedTask = await Task.findByIdAndDelete(taskId);
    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ message: "Server error while deleting task" });
  }
});

// Update task by ID
app.put("/api/tasks/:taskId", async (req, res) => {
  const { taskId } = req.params;
  const { title, description, dueDate, assignedTo, status } = req.body;

  try {
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        title,
        description,
        dueDate,
        assignedTo,
        status,
      },
      { new: true } // return the updated document
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task updated successfully", task: updatedTask });
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json({ message: "Server error while updating task" });
  }
});


// --- Start Server ---
app.listen(5000, () => console.log("Server running on http://localhost:5000"));