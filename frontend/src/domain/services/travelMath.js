// src/domain/services/travelMath.js

/**
 * Calculates Haversine distance in km
 */
export const getDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + 
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Estimates transit time and mode based on distance
 */
export const estimateTransit = (distance) => {
  const roadDistance = distance * 1.4;
  if (roadDistance < 1.2) {
    const mins = Math.max(2, Math.round((roadDistance / 5) * 60));
    return { mode: 'directions_walk', time: `${mins} min walk` };
  } else {
    const mins = Math.max(5, Math.round((roadDistance / 30) * 60));
    return { mode: 'local_taxi', time: `${mins} min Uber` };
  }
};
