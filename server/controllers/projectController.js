const Project = require('../models/Project');
const Task = require('../models/Task');

// GET /api/projects
exports.getProjects = async (req, res, next) => {
  try {
    let query = {};

    // regular users only see projects they're a member of
    if (req.user.role !== 'admin') {
      query.members = req.user._id;
    }

    const projects = await Project.find(query)
      .populate('createdBy', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: -1 });

    // attach task counts to each project
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const taskCounts = await Task.aggregate([
          { $match: { project: project._id } },
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const counts = { total: 0, todo: 0, 'in-progress': 0, review: 0, done: 0 };
        taskCounts.forEach(tc => {
          counts[tc._id] = tc.count;
          counts.total += tc.count;
        });

        return { ...project.toObject(), taskCounts: counts };
      })
    );

    res.json(projectsWithCounts);
  } catch (err) {
    next(err);
  }
};

// GET /api/projects/:id
exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // non-admin users must be a member
    if (req.user.role !== 'admin' && !project.members.some(m => m._id.equals(req.user._id))) {
      return res.status(403).json({ message: 'Not authorized to view this project' });
    }

    const tasks = await Task.find({ project: project._id })
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json({ ...project.toObject(), tasks });
  } catch (err) {
    next(err);
  }
};

// POST /api/projects (admin only)
exports.createProject = async (req, res, next) => {
  try {
    const { title, description, status, priority, members, deadline } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Project title is required' });
    }

    const project = await Project.create({
      title: title.trim(),
      description: description || '',
      status: status || 'planning',
      priority: priority || 'medium',
      members: members || [],
      deadline,
      createdBy: req.user._id
    });

    const populated = await Project.findById(project._id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

// PUT /api/projects/:id (admin only)
exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      project[key] = updates[key];
    });

    await project.save();

    const populated = await Project.findById(project._id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    res.json(populated);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/projects/:id (admin only)
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // delete all tasks under this project too
    await Task.deleteMany({ project: project._id });
    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: 'Project deleted' });
  } catch (err) {
    next(err);
  }
};
