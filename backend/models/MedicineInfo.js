const mongoose = require('mongoose');

const MedicineInfoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a medicine name'],
    unique: true,
    trim: true,
    index: true,
  },
  use: {
    type: String,
    required: [true, 'Please add the medicine uses'],
    trim: true,
  },
  sideEffects: {
    type: String,
    required: [true, 'Please add side effects information'],
    trim: true,
  },
  precautions: {
    type: String,
    required: [true, 'Please add precautions info'],
    trim: true,
  },
});

module.exports = mongoose.model('MedicineInfo', MedicineInfoSchema);
