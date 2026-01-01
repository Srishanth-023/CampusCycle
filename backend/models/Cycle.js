const mongoose = require('mongoose');

const cycleSchema = new mongoose.Schema({
  rfid: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['IN_USE', 'PARKED'],
    default: 'PARKED',
    required: true
  }
}, {
  timestamps: true
});

// Index for fast RFID lookups
cycleSchema.index({ rfid: 1 });
cycleSchema.index({ status: 1 });

module.exports = mongoose.model('Cycle', cycleSchema);
