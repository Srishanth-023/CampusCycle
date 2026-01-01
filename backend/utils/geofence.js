/**
 * Geofencing Utility
 * Uses Haversine formula to calculate distance between two points
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {Number} lat1 - Latitude of point 1
 * @param {Number} lon1 - Longitude of point 1
 * @param {Number} lat2 - Latitude of point 2
 * @param {Number} lon2 - Longitude of point 2
 * @returns {Number} Distance in meters
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Check if a point is within a geofence
 * @param {Number} userLat - User's latitude
 * @param {Number} userLon - User's longitude
 * @param {Number} boothLat - Booth's latitude
 * @param {Number} boothLon - Booth's longitude
 * @param {Number} radius - Geofence radius in meters
 * @returns {Boolean} True if user is within geofence
 */
function isWithinGeofence(userLat, userLon, boothLat, boothLon, radius) {
  const distance = calculateDistance(userLat, userLon, boothLat, boothLon);
  return distance <= radius;
}

/**
 * Find which booth the user is currently inside (if any)
 * @param {Number} userLat - User's latitude
 * @param {Number} userLon - User's longitude
 * @param {Array} booths - Array of booth objects with location data
 * @returns {Object|null} Active booth object or null
 */
function findActiveBooth(userLat, userLon, booths) {
  for (const booth of booths) {
    if (isWithinGeofence(
      userLat, 
      userLon, 
      booth.location.lat, 
      booth.location.lon, 
      booth.location.radius
    )) {
      return booth;
    }
  }
  return null;
}

module.exports = {
  calculateDistance,
  isWithinGeofence,
  findActiveBooth
};
