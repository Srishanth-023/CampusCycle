const mongoose = require('mongoose');

const boothSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  location: {
    lat: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    lon: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    },
    radius: {
      type: Number,
      required: true,
      default: 100, // Default radius in meters
      min: 10
    }
  }
}, {
  timestamps: true
});

// Index for efficient geospatial queries
boothSchema.index({ 'location.lat': 1, 'location.lon': 1 });

module.exports = mongoose.model('Booth', boothSchema);
