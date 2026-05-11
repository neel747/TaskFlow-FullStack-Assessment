const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

// GET /api/dashboard/stats
exports.getStats = async (req, res, next) => {
  try {
    let taskQuery = {};
    let projectQuery = {};

    // regular users only see their own data
    if (req.user.role !== 'admin') {
      taskQuery.assignedTo = req.user._id;
      projectQuery.members = req.user._id;
    }

    // basic counts
    const totalProjects = await Project.countDocuments(projectQuery);
    const totalTasks = await Task.countDocuments(taskQuery);

    // task status breakdown
    const tasksByStatus = await Task.aggregate([
      { $match: taskQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statusMap = { todo: 0, 'in-progress': 0, review: 0, done: 0 };
    tasksByStatus.forEach(t => { statusMap[t._id] = t.count; });

    // tasks by priority
    const tasksByPriority = await Task.aggregate([
      { $match: taskQuery },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    const priorityMap = { low: 0, medium: 0, high: 0, urgent: 0 };
    tasksByPriority.forEach(t => { priorityMap[t._id] = t.count; });

    // overdue tasks (deadline passed, not done)
    const now = new Date();
    const overdueTasks = await Task.countDocuments({
      ...taskQuery,
      deadline: { $lt: now },
      status: { $ne: 'done' }
    });

    // deadline risk - tasks due within 3 days that aren't done
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const atRiskTasks = await Task.find({
      ...taskQuery,
      deadline: { $gte: now, $lte: threeDaysFromNow },
      status: { $ne: 'done' }
    })
      .populate('assignedTo', 'name')
      .populate('project', 'title')
      .sort({ deadline: 1 })
      .limit(10);

    // recent activity - last 10 updated tasks
    const recentTasks = await Task.find(taskQuery)
      .populate('assignedTo', 'name')
      .populate('project', 'title')
      .sort({ updatedAt: -1 })
      .limit(8);

    // team members count (admin only)
    let teamCount = 0;
    if (req.user.role === 'admin') {
      teamCount = await User.countDocuments();
    }

    // completion rate
    const completionRate = totalTasks > 0
      ? Math.round((statusMap.done / totalTasks) * 100)
      : 0;

    res.json({
      totalProjects,
      totalTasks,
      tasksByStatus: statusMap,
      tasksByPriority: priorityMap,
      overdueTasks,
      atRiskTasks,
      recentTasks,
      teamCount,
      completionRate
    });
  } catch (err) {
    next(err);
  }
};
