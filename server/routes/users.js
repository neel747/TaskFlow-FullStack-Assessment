const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// GET /api/users - admin only, for assigning tasks
router.get('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const users = await User.find().select('name email role').sort({ name: 1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
