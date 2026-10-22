import Task from '../models/Task.js';

/**
 * @desc    Get real-time dashboard statistics for authenticated user
 * @route   GET /api/v1/dashboard/stats
 * @access  Private
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Parallel aggregate/queries for maximum performance
    const [
      totalTasks,
      todoTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
      dueTodayTasks,
      priorityCounts,
      categoryCounts,
      upcomingDeadlines,
      recentTasks,
    ] = await Promise.all([
      Task.countDocuments({ userId }),
      Task.countDocuments({ userId, status: 'To Do' }),
      Task.countDocuments({ userId, status: 'In Progress' }),
      Task.countDocuments({ userId, status: 'Completed' }),
      Task.countDocuments({
        userId,
        dueDate: { $lt: startOfToday },
        status: { $ne: 'Completed' },
      }),
      Task.countDocuments({
        userId,
        dueDate: { $gte: startOfToday, $lte: endOfToday },
      }),
      Task.aggregate([
        { $match: { userId } },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        { $match: { userId } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
      Task.find({
        userId,
        dueDate: { $gte: startOfToday },
        status: { $ne: 'Completed' },
      })
        .sort({ dueDate: 1 })
        .limit(5),
      Task.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Format aggregation results into easy-to-chart arrays
    const priorityDistribution = [
      { name: 'Low', count: 0 },
      { name: 'Medium', count: 0 },
      { name: 'High', count: 0 },
    ];
    priorityCounts.forEach((item) => {
      const match = priorityDistribution.find((p) => p.name === item._id);
      if (match) match.count = item.count;
    });

    const categoryDistribution = [
      { name: 'Work', count: 0 },
      { name: 'Personal', count: 0 },
      { name: 'Study', count: 0 },
      { name: 'Project', count: 0 },
      { name: 'Other', count: 0 },
    ];
    categoryCounts.forEach((item) => {
      const match = categoryDistribution.find((c) => c.name === item._id);
      if (match) match.count = item.count;
    });

    const statusDistribution = [
      { name: 'To Do', value: todoTasks, color: '#64748b' },
      { name: 'In Progress', value: inProgressTasks, color: '#3b82f6' },
      { name: 'Completed', value: completedTasks, color: '#10b981' },
    ];

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalTasks,
          todoTasks,
          inProgressTasks,
          completedTasks,
          overdueTasks,
          dueTodayTasks,
          completionRate,
        },
        charts: {
          statusDistribution,
          priorityDistribution,
          categoryDistribution,
        },
        upcomingDeadlines,
        recentTasks,
      },
    });
  } catch (error) {
    next(error);
  }
};
