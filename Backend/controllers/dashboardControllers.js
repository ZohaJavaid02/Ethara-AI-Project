import Task from "../models/Task.js";
import Project from "../models/Project.js";
import User from "../models/User.js";

export const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const now = new Date();

    if (userRole === "Admin") {
      const [projects, total, todo, inProgress, done, overdue, totalUsers] = await Promise.all([
        Project.countDocuments(),
        Task.countDocuments(),
        Task.countDocuments({ status: "Todo" }),
        Task.countDocuments({ status: "In Progress" }),
        Task.countDocuments({ status: "Done" }),
        Task.countDocuments({ dueDate: { $lt: now }, status: { $ne: "Done" } }),
        User.countDocuments(),
      ]);

      return res.json({
        projects,
        total,
        todo,
        inProgress,
        done,
        overdue,
        totalUsers,
        totalProjects: projects,
        totalTasks: total,
        pendingTasks: todo,
        inProgressTasks: inProgress,
        completedTasks: done,
      });
    }

    // Regular users see their own data
    const userProjects = await Project.find({ members: userId });

    const [total, todo, inProgress, done, overdue] = await Promise.all([
      Task.countDocuments({ assignedTo: userId }),
      Task.countDocuments({ assignedTo: userId, status: "Todo" }),
      Task.countDocuments({ assignedTo: userId, status: "In Progress" }),
      Task.countDocuments({ assignedTo: userId, status: "Done" }),
      Task.countDocuments({
        assignedTo: userId,
        dueDate: { $lt: now },
        status: { $ne: "Done" },
      }),
    ]);

    res.json({
      projects: userProjects.length,
      total,
      todo,
      inProgress,
      done,
      overdue,
      myProjects: userProjects.length,
      myTasks: total,
      pendingTasks: todo,
      inProgressTasks: inProgress,
      completedTasks: done,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};