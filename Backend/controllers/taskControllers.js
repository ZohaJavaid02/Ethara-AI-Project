import Task from "../models/Task.js";
import Project from "../models/Project.js";

export const createTask = async (req, res) => {
  const task = await Task.create({ ...req.body, createdBy: req.user._id });

  if (task.project && task.assignedTo) {
    await Project.findByIdAndUpdate(task.project, {
      $addToSet: { members: task.assignedTo },
    });
  }

  res.status(201).json(task);
};

export const getTasks = async (req, res) => {
  const filter = req.user.role === "Admin" ? {} : { assignedTo: req.user._id };
  if (req.query.project) filter.project = req.query.project;
  const tasks = await Task.find(filter)
    .populate("assignedTo", "name email")
    .populate("project", "name");
  res.json(tasks);
};

export const updateTask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: "Not found" });

  const previousAssignedTo = task.assignedTo;

  // Members can only update status of their own tasks
  if (req.user.role !== "Admin" && String(task.assignedTo) !== String(req.user._id))
    return res.status(403).json({ message: "Not authorized" });

  Object.assign(task, req.body);
  await task.save();

  if (task.project && task.assignedTo) {
    await Project.findByIdAndUpdate(task.project, {
      $addToSet: { members: task.assignedTo },
    });
  }

  if (
    task.project &&
    previousAssignedTo &&
    String(previousAssignedTo) !== String(task.assignedTo)
  ) {
    const remainingTasks = await Task.countDocuments({
      project: task.project,
      assignedTo: previousAssignedTo,
    });

    if (remainingTasks === 0) {
      await Project.findByIdAndUpdate(task.project, {
        $pull: { members: previousAssignedTo },
      });
    }
  }

  res.json(task);
};

export const deleteTask = async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};