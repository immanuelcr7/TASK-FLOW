import Task from '../models/Task.js';

/**
 * @desc    Get all tasks for the logged in user with filtering, search, sorting, and pagination
 * @route   GET /api/v1/tasks
 * @access  Private
 */
export const getTasks = async (req, res, next) => {
  try {
    const {
      search,
      status,
      priority,
      category,
      dueDateFilter, // 'today', 'overdue', 'upcoming'
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
      all = 'false', // If 'true', return all tasks without pagination (e.g. for kanban/calendar)
    } = req.query;

    // Strict user scoping
    const query = { userId: req.user._id };

    // Search by title or description
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    // Filter by status
    if (status && status !== 'All') {
      query.status = status;
    }

    // Filter by priority
    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by due date
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (dueDateFilter === 'overdue') {
      query.dueDate = { $lt: startOfToday };
      query.status = { $ne: 'Completed' };
    } else if (dueDateFilter === 'today') {
      query.dueDate = { $gte: startOfToday, $lte: endOfToday };
    } else if (dueDateFilter === 'upcoming') {
      query.dueDate = { $gt: endOfToday };
    }

    // Determine sort order
    const sort = {};
    const validSortFields = ['createdAt', 'dueDate', 'priority', 'title', 'status'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    sort[sortField] = sortOrder === 'asc' ? 1 : -1;

    // If 'all' is true, return all without pagination
    if (all === 'true') {
      const tasks = await Task.find(query).sort(sort);
      return res.status(200).json({
        success: true,
        data: {
          tasks,
          total: tasks.length,
        },
      });
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [tasks, totalTasks] = await Promise.all([
      Task.find(query).sort(sort).skip(skip).limit(limitNum),
      Task.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalTasks / limitNum) || 1;

    return res.status(200).json({
      success: true,
      data: {
        tasks,
        pagination: {
          totalTasks,
          totalPages,
          currentPage: pageNum,
          limit: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new task
 * @route   POST /api/v1/tasks
 * @access  Private
 */
export const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, category, dueDate } = req.body;

    const taskData = {
      userId: req.user._id,
      title,
      description: description || '',
      status: status || 'To Do',
      priority: priority || 'Medium',
      category: category || 'Work',
      dueDate,
      completedAt: status === 'Completed' ? new Date() : null,
    };

    const task = await Task.create(taskData);

    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: {
        task,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single task by ID
 * @route   GET /api/v1/tasks/:id
 * @access  Private
 */
export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id, // Strict ownership check
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or access denied',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        task,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing task
 * @route   PATCH /api/v1/tasks/:id
 * @access  Private
 */
export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id, // Strict ownership check
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or access denied',
      });
    }

    const { title, description, status, priority, category, dueDate } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (category !== undefined) task.category = category;
    if (dueDate !== undefined) task.dueDate = dueDate;

    // Handle status transitions and completedAt timestamp
    if (status !== undefined) {
      if (status === 'Completed' && task.status !== 'Completed') {
        task.completedAt = new Date();
      } else if (status !== 'Completed' && task.status === 'Completed') {
        task.completedAt = null;
      }
      task.status = status;
    }

    await task.save();

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: {
        task,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a task
 * @route   DELETE /api/v1/tasks/:id
 * @access  Private
 */
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id, // Strict ownership check
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or access denied',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: {
        id: req.params.id,
      },
    });
  } catch (error) {
    next(error);
  }
};
