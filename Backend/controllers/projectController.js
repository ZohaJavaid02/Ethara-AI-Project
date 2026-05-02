import Project from "../models/Project.js";
import Task from "../models/Task.js";

const mergeTaskMembers = async (projects) => {
  const projectIds = projects.map((project) => project._id);
  const tasks = await Task.find({ project: { $in: projectIds }, assignedTo: { $ne: null } })
    .populate("assignedTo", "name email");

  const taskMembersByProject = tasks.reduce((accumulator, task) => {
    const key = String(task.project);
    if (!accumulator[key]) accumulator[key] = [];
    accumulator[key].push(task.assignedTo);
    return accumulator;
  }, {});

  return projects.map((project) => {
    const inferredMembers = taskMembersByProject[String(project._id)] || [];
    const mergedMembers = [...project.members];
    inferredMembers.forEach((member) => {
      if (!mergedMembers.some((existing) => String(existing._id) === String(member._id))) {
        mergedMembers.push(member);
      }
    });
    return { ...project.toObject(), members: mergedMembers, actualMembers: project.members };
  });
};

export const createProject = async (req, res) => {
  const { name, description, members } = req.body;
  const project = await Project.create({
    name, description, members, createdBy: req.user._id,
  });
  res.status(201).json(project);
};

export const getProjects = async (req, res) => {
  const filter = req.user.role === "Admin"
    ? {}
    : {
        $or: [
          { createdBy: req.user._id },
          { members: { $in: [req.user._id] } },
          { _id: { $in: await Task.distinct("project", { assignedTo: req.user._id }) } },
        ],
      };

  const projects = await Project.find(filter)
    .populate("createdBy", "name email")
    .populate("members", "name email");

  res.json(await mergeTaskMembers(projects));
};

export const getProjectById = async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate("createdBy", "name email")
    .populate("members", "name email");
  if (!project) return res.status(404).json({ message: "Not found" });

  const tasks = await Task.find({ project: project._id, assignedTo: { $ne: null } })
    .populate("assignedTo", "name email");

  const mergedMembers = [...project.members];
  tasks.forEach((task) => {
    const member = task.assignedTo;
    if (!mergedMembers.some((existing) => String(existing._id) === String(member._id))) {
      mergedMembers.push(member);
    }
  });

  res.json({ ...project.toObject(), members: mergedMembers, actualMembers: project.members });
};

export const updateProject = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: "Not found" });

  const nextMembers = Array.isArray(req.body.members)
    ? req.body.members.map((member) => String(member))
    : project.members.map((member) => String(member));

  const removedMembers = project.members
    .map((member) => String(member))
    .filter((memberId) => !nextMembers.includes(memberId));

  if (removedMembers.length > 0) {
    await Task.updateMany(
      { project: project._id, assignedTo: { $in: removedMembers } },
      { assignedTo: req.user._id }
    );
  }

  if (req.body.name !== undefined) project.name = req.body.name;
  if (req.body.description !== undefined) project.description = req.body.description;
  if (req.body.status !== undefined) project.status = req.body.status;
  if (Array.isArray(req.body.members)) project.members = req.body.members;

  await project.save();
  await project.populate("createdBy", "name email");
  await project.populate("members", "name email");
  res.json(project);
};

export const deleteProject = async (req, res) => {
  await Project.findByIdAndDelete(req.params.id);
  res.json({ message: "Project deleted" });
};