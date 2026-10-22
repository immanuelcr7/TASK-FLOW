import { TASK_STATUSES, TASK_PRIORITIES, TASK_CATEGORIES } from '../models/Task.js';

/**
 * Validate task creation request body
 */
export const validateCreateTask = (req, res, next) => {
  const { title, description, status, priority, category, dueDate } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length < 2) {
    errors.push({ field: 'title', message: 'Title must be at least 2 characters long' });
  } else if (title.trim().length > 200) {
    errors.push({ field: 'title', message: 'Title cannot exceed 200 characters' });
  }

  if (description !== undefined && typeof description === 'string' && description.length > 2000) {
    errors.push({ field: 'description', message: 'Description cannot exceed 2000 characters' });
  }

  if (status && !TASK_STATUSES.includes(status)) {
    errors.push({ field: 'status', message: `Status must be one of: ${TASK_STATUSES.join(', ')}` });
  }

  if (priority && !TASK_PRIORITIES.includes(priority)) {
    errors.push({ field: 'priority', message: `Priority must be one of: ${TASK_PRIORITIES.join(', ')}` });
  }

  if (category && !TASK_CATEGORIES.includes(category)) {
    errors.push({ field: 'category', message: `Category must be one of: ${TASK_CATEGORIES.join(', ')}` });
  }

  if (!dueDate) {
    errors.push({ field: 'dueDate', message: 'Due date is required' });
  } else {
    const parsedDate = new Date(dueDate);
    if (isNaN(parsedDate.getTime())) {
      errors.push({ field: 'dueDate', message: 'Due date must be a valid date' });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Task validation failed.',
      errors,
    });
  }

  // Normalize inputs
  req.body.title = title.trim();
  if (description) req.body.description = description.trim();
  if (status) req.body.status = status;
  if (priority) req.body.priority = priority;
  if (category) req.body.category = category;
  req.body.dueDate = new Date(dueDate);

  next();
};

/**
 * Validate task update request body
 */
export const validateUpdateTask = (req, res, next) => {
  const { title, description, status, priority, category, dueDate } = req.body;
  const errors = [];

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length < 2) {
      errors.push({ field: 'title', message: 'Title must be at least 2 characters long' });
    } else if (title.trim().length > 200) {
      errors.push({ field: 'title', message: 'Title cannot exceed 200 characters' });
    } else {
      req.body.title = title.trim();
    }
  }

  if (description !== undefined) {
    if (typeof description === 'string' && description.length > 2000) {
      errors.push({ field: 'description', message: 'Description cannot exceed 2000 characters' });
    } else {
      req.body.description = typeof description === 'string' ? description.trim() : '';
    }
  }

  if (status !== undefined) {
    if (!TASK_STATUSES.includes(status)) {
      errors.push({ field: 'status', message: `Status must be one of: ${TASK_STATUSES.join(', ')}` });
    }
  }

  if (priority !== undefined) {
    if (!TASK_PRIORITIES.includes(priority)) {
      errors.push({ field: 'priority', message: `Priority must be one of: ${TASK_PRIORITIES.join(', ')}` });
    }
  }

  if (category !== undefined) {
    if (!TASK_CATEGORIES.includes(category)) {
      errors.push({ field: 'category', message: `Category must be one of: ${TASK_CATEGORIES.join(', ')}` });
    }
  }

  if (dueDate !== undefined) {
    const parsedDate = new Date(dueDate);
    if (isNaN(parsedDate.getTime())) {
      errors.push({ field: 'dueDate', message: 'Due date must be a valid date' });
    } else {
      req.body.dueDate = parsedDate;
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Task update validation failed.',
      errors,
    });
  }

  next();
};
