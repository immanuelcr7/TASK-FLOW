import express from 'express';
import {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { validateCreateTask, validateUpdateTask } from '../validators/taskValidator.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All task routes require authentication
router.use(protect);

router.route('/')
  .get(getTasks)
  .post(validateCreateTask, createTask);

router.route('/:id')
  .get(getTaskById)
  .patch(validateUpdateTask, updateTask)
  .delete(deleteTask);

export default router;
