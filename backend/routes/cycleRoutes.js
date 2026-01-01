const express = require('express');
const router = express.Router();
const {
  getAllCycles,
  getCycleByRfid,
  createCycle,
  updateCycle,
  deleteCycle
} = require('../controllers/cycleController');

// Get all cycles (can filter by status via query param)
router.get('/', getAllCycles);

// Get cycle by RFID
router.get('/:rfid', getCycleByRfid);

// Create cycle
router.post('/', createCycle);

// Update cycle
router.put('/:rfid', updateCycle);

// Delete cycle
router.delete('/:rfid', deleteCycle);

module.exports = router;
