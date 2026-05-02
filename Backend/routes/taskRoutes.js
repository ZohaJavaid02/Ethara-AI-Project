import express from "express";
import { createTask, getTasks, updateTask, deleteTask } from "../controllers/taskControllers.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();
router.use(protect);
router.route("/").get(getTasks).post(authorize("Admin"), createTask);
router.route("/:id").put(updateTask).delete(authorize("Admin"), deleteTask);
export default router;