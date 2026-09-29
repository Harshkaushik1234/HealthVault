const mongoose = require('mongoose');

const MedicalRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileName: {
    type: String,
    required: [true, 'Please add a file name'],
    trim: true,
  },
  filePath: {
    type: String,
    required: [true, 'Please add a file path'],
  },
  cloudinaryId: {
    type: String,
    required: [true, 'Please add a Cloudinary public ID'],
  },
  category: {
    type: String,
    required: [true, 'Please specify a category'],
    enum: ['Prescription', 'Lab Report', 'Vaccine Record', 'Billing/Invoice', 'Other'],
    default: 'Other',
  },
  date: {
    type: Date,
    required: [true, 'Please add a record date'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('MedicalRecord', MedicalRecordSchema);
