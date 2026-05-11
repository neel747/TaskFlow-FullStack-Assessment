const Task = require('../models/Task');
const Comment = require('../models/Comment');

// GET /api/tasks
exports.getTasks = async (req, res, next) => {
  try {
    let query = {};

    // filter by project
    if (req.query.project) {
      query.project = req.query.project;
    }

    // filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // filter by priority
    if (req.query.priority) {
      query.priority = req.query.priority;
    }

    // regular users only see their assigned tasks
    if (req.user.role !== 'admin') {
      query.assignedTo = req.user._id;
    }

    // if admin wants to filter by assignee
    if (req.query.assignedTo && req.user.role === 'admin') {
      query.assignedTo = req.query.assignedTo;
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('project', 'title')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks/:id
exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('project', 'title')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const comments = await Comment.find({ task: task._id })
      .populate('user', 'name email')
      .sort({ createdAt: 1 });

    res.json({ ...task.toObject(), comments });
  } catch (err) {
    next(err);
  }
};

// POST /api/tasks (admin only)
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, project, assignedTo, deadline } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Task title is required' });
    }
    if (!project) {
      return res.status(400).json({ message: 'Project is required' });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description || '',
      status: status || 'todo',
      priority: priority || 'medium',
      project,
      assignedTo: assignedTo || null,
      deadline,
      createdBy: req.user._id
    });

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('project', 'title')
      .populate('createdBy', 'name');

    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

// PUT /api/tasks/:id
exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // regular users can only update status of their own tasks
    if (req.user.role !== 'admin') {
      if (!task.assignedTo || !task.assignedTo.equals(req.user._id)) {
        return res.status(403).json({ message: 'You can only update your own tasks' });
      }
      // users can only change status
      const allowed = ['status'];
      const keys = Object.keys(req.body);
      const isValid = keys.every(k => allowed.includes(k));
      if (!isValid) {
        return res.status(403).json({ message: 'You can only update task status' });
      }
    }

    Object.keys(req.body).forEach(key => {
      task[key] = req.body[key];
    });

    await task.save();

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('project', 'title')
      .populate('createdBy', 'name');

    res.json(populated);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/tasks/:id (admin only)
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await Comment.deleteMany({ task: task._id });
    await Task.findByIdAndDelete(req.params.id);

    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};

// POST /api/tasks/:id/comments
exports.addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const comment = await Comment.create({
      text: text.trim(),
      task: task._id,
      user: req.user._id
    });

    const populated = await Comment.findById(comment._id)
      .populate('user', 'name email');

    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks/:id/comments
exports.getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ task: req.params.id })
      .populate('user', 'name email')
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (err) {
    next(err);
  }
};
