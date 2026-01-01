const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
  unitId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  boothId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booth',
    required: true
  },
  status: {
    type: String,
    enum: ['FREE', 'OCCUPIED'],
    default: 'FREE',
    required: true
  },
  cycleRfid: {
    type: String,
    default: null,
    trim: true
  }
}, {
  timestamps: true
});

// Composite index for efficient queries
unitSchema.index({ boothId: 1, status: 1 });
unitSchema.index({ cycleRfid: 1 }, { sparse: true });

// Validation: If status is OCCUPIED, cycleRfid must be present
unitSchema.pre('save', function(next) {
  if (this.status === 'OCCUPIED' && !this.cycleRfid) {
    return next(new Error('Occupied unit must have a cycle RFID'));
  }
  if (this.status === 'FREE' && this.cycleRfid) {
    // Auto-clear cycleRfid when status becomes FREE
    this.cycleRfid = null;
  }
  next();
});

module.exports = mongoose.model('Unit', unitSchema);
