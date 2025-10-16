/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in meters
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in meters
  return distance;
}

/**
 * Verify if user is within allowed radius of a location
 * @param {number} userLat - User's latitude
 * @param {number} userLng - User's longitude
 * @param {number} sessionLat - Session location latitude
 * @param {number} sessionLng - Session location longitude
 * @param {number} radiusMeters - Allowed radius in meters (default 50)
 * @returns {boolean} True if within radius
 */
function isWithinRadius(userLat, userLng, sessionLat, sessionLng, radiusMeters = 50) {
  const distance = calculateDistance(userLat, userLng, sessionLat, sessionLng);
  return distance <= radiusMeters;
}

module.exports = {
  calculateDistance,
  isWithinRadius,
};
