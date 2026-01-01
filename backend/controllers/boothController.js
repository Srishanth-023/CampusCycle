const Booth = require('../models/Booth');
const { findActiveBooth } = require('../utils/geofence');

/**
 * Get all booths
 * GET /api/booths
 */
const getAllBooths = async (req, res) => {
  try {
    const booths = await Booth.find();
    res.status(200).json({
      success: true,
      count: booths.length,
      data: booths
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching booths',
      error: error.message
    });
  }
};

/**
 * Get a single booth by ID
 * GET /api/booths/:id
 */
const getBoothById = async (req, res) => {
  try {
    const booth = await Booth.findById(req.params.id);
    
    if (!booth) {
      return res.status(404).json({
        success: false,
        message: 'Booth not found'
      });
    }

    res.status(200).json({
      success: true,
      data: booth
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching booth',
      error: error.message
    });
  }
};

/**
 * Create a new booth
 * POST /api/booths
 */
const createBooth = async (req, res) => {
  try {
    const { name, location } = req.body;

    // Validation
    if (!name || !location || !location.lat || !location.lon) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name and location (lat, lon)'
      });
    }

    const booth = await Booth.create({
      name,
      location: {
        lat: location.lat,
        lon: location.lon,
        radius: location.radius || 100
      }
    });

    res.status(201).json({
      success: true,
      data: booth
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating booth',
      error: error.message
    });
  }
};

/**
 * Check which booth the user is currently in based on their location
 * POST /api/booths/check-geofence
 */
const checkGeofence = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    // Validation
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide latitude and longitude'
      });
    }

    // Get all booths
    const booths = await Booth.find();
    
    // Find active booth
    const activeBooth = findActiveBooth(latitude, longitude, booths);

    if (activeBooth) {
      res.status(200).json({
        success: true,
        activeBoothId: activeBooth._id,
        boothName: activeBooth.name
      });
    } else {
      res.status(200).json({
        success: true,
        activeBoothId: null,
        message: 'Not within any booth geofence'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking geofence',
      error: error.message
    });
  }
};

/**
 * Update a booth
 * PUT /api/booths/:id
 */
const updateBooth = async (req, res) => {
  try {
    const booth = await Booth.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!booth) {
      return res.status(404).json({
        success: false,
        message: 'Booth not found'
      });
    }

    res.status(200).json({
      success: true,
      data: booth
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating booth',
      error: error.message
    });
  }
};

/**
 * Delete a booth
 * DELETE /api/booths/:id
 */
const deleteBooth = async (req, res) => {
  try {
    const booth = await Booth.findByIdAndDelete(req.params.id);

    if (!booth) {
      return res.status(404).json({
        success: false,
        message: 'Booth not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booth deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting booth',
      error: error.message
    });
  }
};

module.exports = {
  getAllBooths,
  getBoothById,
  createBooth,
  checkGeofence,
  updateBooth,
  deleteBooth
};
