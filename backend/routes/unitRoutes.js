const express = require('express');
const router = express.Router();
const {
  getAllUnits,
  getUnitById,
  createUnit,
  parkCycle,
  takeCycle,
  updateUnit,
  deleteUnit
} = require('../controllers/unitController');

// Get all units (can filter by boothId via query param)
router.get('/', getAllUnits);

// Park a cycle
router.post('/park', parkCycle);

// Take a cycle
router.post('/take', takeCycle);

// Get single unit
router.get('/:id', getUnitById);

// Create unit
router.post('/', createUnit);

// Update unit
router.put('/:id', updateUnit);

// Delete unit
router.delete('/:id', deleteUnit);

module.exports = router;
