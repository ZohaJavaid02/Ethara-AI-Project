import express from "express";
import {
  createProject, getProjects, getProjectById, updateProject, deleteProject,
} from "../controllers/projectController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();
router.use(protect);
router.route("/").get(getProjects).post(authorize("Admin"), createProject);
router
  .route("/:id")
  .get(getProjectById)
  .put(authorize("Admin"), updateProject)
  .delete(authorize("Admin"), deleteProject);
export default router;