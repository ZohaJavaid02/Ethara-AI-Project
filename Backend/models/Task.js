import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["Todo", "In Progress", "Done"], default: "Todo" },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    dueDate: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);