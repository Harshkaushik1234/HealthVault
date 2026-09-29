const Reminder = require('../models/Reminder');

// @desc    Add a new medicine reminder
// @route   POST /api/reminders
// @access  Private
const addReminder = async (req, res) => {
  try {
    const { medicineName, dosage, time, notes } = req.body;

    if (!medicineName || !dosage || !time) {
      return res.status(400).json({
        success: false,
        message: 'Please provide medicine name, dosage, and time',
      });
    }

    const reminder = await Reminder.create({
      userId: req.user.id,
      medicineName,
      dosage,
      time,
      notes: notes || '',
    });

    return res.status(201).json({
      success: true,
      message: 'Reminder added successfully',
      reminder,
    });
  } catch (error) {
    console.error('Add reminder error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error, could not add reminder' });
  }
};

// @desc    Get all reminders for logged-in user
// @route   GET /api/reminders
// @access  Private
const getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.user.id }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: reminders.length,
      reminders,
    });
  } catch (error) {
    console.error('Get reminders error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error, could not retrieve reminders' });
  }
};

// @desc    Delete a reminder
// @route   DELETE /api/reminders/:id
// @access  Private
const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    // Check user ownership
    if (reminder.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this reminder' });
    }

    await reminder.deleteOne();

    return res.json({
      success: true,
      message: 'Reminder deleted successfully',
    });
  } catch (error) {
    console.error('Delete reminder error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error, could not delete reminder' });
  }
};

module.exports = {
  addReminder,
  getReminders,
  deleteReminder,
};
