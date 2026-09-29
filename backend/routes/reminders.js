const express = require('express');
const router = express.Router();
const {
  addReminder,
  getReminders,
  deleteReminder,
} = require('../controllers/reminderController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, addReminder)
  .get(protect, getReminders);

router.route('/:id')
  .delete(protect, deleteReminder);

module.exports = router;
