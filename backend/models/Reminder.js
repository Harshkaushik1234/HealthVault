const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  medicineName: {
    type: String,
    required: [true, 'Please add a medicine name'],
    trim: true,
  },
  dosage: {
    type: String,
    required: [true, 'Please add a dosage amount'],
    trim: true,
  },
  time: {
    type: String,
    required: [true, 'Please specify a reminder time'],
  },
  notes: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Reminder', ReminderSchema);
