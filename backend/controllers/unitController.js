const Unit = require('../models/Unit');
const Cycle = require('../models/Cycle');
const Booth = require('../models/Booth');
const { isWithinGeofence } = require('../utils/geofence');

/**
 * Get all units (optionally filter by boothId)
 * GET /api/units?boothId=xyz
 */
const getAllUnits = async (req, res) => {
  try {
    const { boothId } = req.query;
    const filter = boothId ? { boothId } : {};
    
    const units = await Unit.find(filter).populate('boothId', 'name location');
    
    res.status(200).json({
      success: true,
      count: units.length,
      data: units
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching units',
      error: error.message
    });
  }
};

/**
 * Get a single unit by ID
 * GET /api/units/:id
 */
const getUnitById = async (req, res) => {
  try {
    const unit = await Unit.findById(req.params.id).populate('boothId', 'name location');
    
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found'
      });
    }

    res.status(200).json({
      success: true,
      data: unit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching unit',
      error: error.message
    });
  }
};

/**
 * Create a new unit
 * POST /api/units
 */
const createUnit = async (req, res) => {
  try {
    const { unitId, boothId } = req.body;

    // Validation
    if (!unitId || !boothId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide unitId and boothId'
      });
    }

    // Check if booth exists
    const booth = await Booth.findById(boothId);
    if (!booth) {
      return res.status(404).json({
        success: false,
        message: 'Booth not found'
      });
    }

    const unit = await Unit.create({
      unitId,
      boothId,
      status: 'FREE',
      cycleRfid: null
    });

    res.status(201).json({
      success: true,
      data: unit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating unit',
      error: error.message
    });
  }
};

/**
 * Park a cycle in a unit
 * POST /api/units/park
 * Body: { unitId, rfid, userLat, userLon }
 */
const parkCycle = async (req, res) => {
  try {
    const { unitId, rfid, userLat, userLon } = req.body;

    // Validation
    if (!unitId || !rfid || userLat === undefined || userLon === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide unitId, rfid, userLat, and userLon'
      });
    }

    // Find the unit
    const unit = await Unit.findOne({ unitId }).populate('boothId');
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found'
      });
    }

    // Check if unit is already occupied
    if (unit.status === 'OCCUPIED') {
      return res.status(400).json({
        success: false,
        message: 'Unit is already occupied'
      });
    }

    // Verify user is within geofence
    const booth = unit.boothId;
    const withinGeofence = isWithinGeofence(
      userLat,
      userLon,
      booth.location.lat,
      booth.location.lon,
      booth.location.radius
    );

    if (!withinGeofence) {
      return res.status(403).json({
        success: false,
        message: 'You are not within the booth geofence'
      });
    }

    // Check if RFID already exists in another unit
    const existingUnit = await Unit.findOne({ cycleRfid: rfid });
    if (existingUnit) {
      return res.status(400).json({
        success: false,
        message: 'This cycle is already parked in another unit'
      });
    }

    // Find or create the cycle
    let cycle = await Cycle.findOne({ rfid });
    if (!cycle) {
      cycle = await Cycle.create({ rfid, status: 'PARKED' });
    } else if (cycle.status === 'PARKED') {
      return res.status(400).json({
        success: false,
        message: 'Cycle is already parked'
      });
    }

    // Update unit
    unit.status = 'OCCUPIED';
    unit.cycleRfid = rfid;
    await unit.save();

    // Update cycle
    cycle.status = 'PARKED';
    await cycle.save();

    // Emit socket event (will be handled by socket.js)
    const io = req.app.get('io');
    io.emit('unitUpdated', {
      unit: await Unit.findById(unit._id).populate('boothId', 'name location')
    });

    res.status(200).json({
      success: true,
      message: 'Cycle parked successfully',
      data: { unit, cycle }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error parking cycle',
      error: error.message
    });
  }
};

/**
 * Take a cycle from a unit
 * POST /api/units/take
 * Body: { unitId, rfid, userLat, userLon }
 */
const takeCycle = async (req, res) => {
  try {
    const { unitId, rfid, userLat, userLon } = req.body;

    // Validation
    if (!unitId || !rfid || userLat === undefined || userLon === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide unitId, rfid, userLat, and userLon'
      });
    }

    // Find the unit
    const unit = await Unit.findOne({ unitId }).populate('boothId');
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found'
      });
    }

    // Check if unit is occupied
    if (unit.status === 'FREE') {
      return res.status(400).json({
        success: false,
        message: 'Unit is already free'
      });
    }

    // Verify RFID matches
    if (unit.cycleRfid !== rfid) {
      return res.status(400).json({
        success: false,
        message: 'RFID does not match the cycle in this unit'
      });
    }

    // Verify user is within geofence
    const booth = unit.boothId;
    const withinGeofence = isWithinGeofence(
      userLat,
      userLon,
      booth.location.lat,
      booth.location.lon,
      booth.location.radius
    );

    if (!withinGeofence) {
      return res.status(403).json({
        success: false,
        message: 'You are not within the booth geofence'
      });
    }

    // Find the cycle
    const cycle = await Cycle.findOne({ rfid });
    if (!cycle) {
      return res.status(404).json({
        success: false,
        message: 'Cycle not found'
      });
    }

    // Update unit
    unit.status = 'FREE';
    unit.cycleRfid = null;
    await unit.save();

    // Update cycle
    cycle.status = 'IN_USE';
    await cycle.save();

    // Emit socket event
    const io = req.app.get('io');
    io.emit('unitUpdated', {
      unit: await Unit.findById(unit._id).populate('boothId', 'name location')
    });

    res.status(200).json({
      success: true,
      message: 'Cycle taken successfully',
      data: { unit, cycle }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error taking cycle',
      error: error.message
    });
  }
};

/**
 * Update a unit
 * PUT /api/units/:id
 */
const updateUnit = async (req, res) => {
  try {
    const unit = await Unit.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('boothId', 'name location');

    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found'
      });
    }

    // Emit socket event
    const io = req.app.get('io');
    io.emit('unitUpdated', { unit });

    res.status(200).json({
      success: true,
      data: unit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating unit',
      error: error.message
    });
  }
};

/**
 * Delete a unit
 * DELETE /api/units/:id
 */
const deleteUnit = async (req, res) => {
  try {
    const unit = await Unit.findByIdAndDelete(req.params.id);

    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Unit deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting unit',
      error: error.message
    });
  }
};

module.exports = {
  getAllUnits,
  getUnitById,
  createUnit,
  parkCycle,
  takeCycle,
  updateUnit,
  deleteUnit
};
