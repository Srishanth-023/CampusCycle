const express = require('express');
const router = express.Router();
const {
  getAllBooths,
  getBoothById,
  createBooth,
  checkGeofence,
  updateBooth,
  deleteBooth
} = require('../controllers/boothController');

// Get all booths
router.get('/', getAllBooths);

// Check geofence (which booth user is in)
router.post('/check-geofence', checkGeofence);

// Get single booth
router.get('/:id', getBoothById);

// Create booth
router.post('/', createBooth);

// Update booth
router.put('/:id', updateBooth);

// Delete booth
router.delete('/:id', deleteBooth);

module.exports = router;
