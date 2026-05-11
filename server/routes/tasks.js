const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  addComment,
  getComments
} = require('../controllers/taskController');

const router = express.Router();

router.get('/', protect, getTasks);
router.get('/:id', protect, getTask);
router.post('/', protect, authorize('admin'), createTask);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, authorize('admin'), deleteTask);

// comments
router.post('/:id/comments', protect, addComment);
router.get('/:id/comments', protect, getComments);

module.exports = router;
