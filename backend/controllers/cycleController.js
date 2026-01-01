const Cycle = require('../models/Cycle');

/**
 * Get all cycles
 * GET /api/cycles
 */
const getAllCycles = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    
    const cycles = await Cycle.find(filter);
    
    res.status(200).json({
      success: true,
      count: cycles.length,
      data: cycles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching cycles',
      error: error.message
    });
  }
};

/**
 * Get a single cycle by RFID
 * GET /api/cycles/:rfid
 */
const getCycleByRfid = async (req, res) => {
  try {
    const cycle = await Cycle.findOne({ rfid: req.params.rfid });
    
    if (!cycle) {
      return res.status(404).json({
        success: false,
        message: 'Cycle not found'
      });
    }

    res.status(200).json({
      success: true,
      data: cycle
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching cycle',
      error: error.message
    });
  }
};

/**
 * Create a new cycle
 * POST /api/cycles
 */
const createCycle = async (req, res) => {
  try {
    const { rfid, status } = req.body;

    // Validation
    if (!rfid) {
      return res.status(400).json({
        success: false,
        message: 'Please provide RFID'
      });
    }

    const cycle = await Cycle.create({
      rfid,
      status: status || 'PARKED'
    });

    res.status(201).json({
      success: true,
      data: cycle
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating cycle',
      error: error.message
    });
  }
};

/**
 * Update a cycle
 * PUT /api/cycles/:rfid
 */
const updateCycle = async (req, res) => {
  try {
    const cycle = await Cycle.findOneAndUpdate(
      { rfid: req.params.rfid },
      req.body,
      { new: true, runValidators: true }
    );

    if (!cycle) {
      return res.status(404).json({
        success: false,
        message: 'Cycle not found'
      });
    }

    res.status(200).json({
      success: true,
      data: cycle
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating cycle',
      error: error.message
    });
  }
};

/**
 * Delete a cycle
 * DELETE /api/cycles/:rfid
 */
const deleteCycle = async (req, res) => {
  try {
    const cycle = await Cycle.findOneAndDelete({ rfid: req.params.rfid });

    if (!cycle) {
      return res.status(404).json({
        success: false,
        message: 'Cycle not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cycle deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting cycle',
      error: error.message
    });
  }
};

module.exports = {
  getAllCycles,
  getCycleByRfid,
  createCycle,
  updateCycle,
  deleteCycle
};
