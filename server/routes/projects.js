const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/projectController');

const router = express.Router();

router.get('/', protect, getProjects);
router.get('/:id', protect, getProject);
router.post('/', protect, authorize('admin'), createProject);
router.put('/:id', protect, authorize('admin'), updateProject);
router.delete('/:id', protect, authorize('admin'), deleteProject);

module.exports = router;
