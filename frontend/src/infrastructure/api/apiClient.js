// src/infrastructure/api/apiClient.js

const API_BASE_URL = 'http://localhost:8080/api';

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'API Request failed');
  return data;
};

export const api = {
  // Auth
  login: (credentials) => request('/login', { method: 'POST', body: JSON.stringify(credentials) }),
  signup: (data) => request('/signup', { method: 'POST', body: JSON.stringify(data) }),

  // Trips
  getTrips: (userId) => request(`/trips?userId=${userId}`),
  createTrip: (tripData) => request('/trips', { method: 'POST', body: JSON.stringify(tripData) }),
  deleteTrip: (tripId) => request(`/trips/${tripId}`, { method: 'DELETE' }),
  updateTripSharing: (tripId, isPublic) => request(`/trips/${tripId}/sharing`, { method: 'PUT', body: JSON.stringify({ isPublic }) }),

  // Stops
  getStops: (tripId, userId) => request(`/stops?tripId=${tripId}&userId=${userId}`),
  createStop: (stopData) => request('/stops', { method: 'POST', body: JSON.stringify(stopData) }),
  updateStop: (id, stopData) => request(`/stops/${id}`, { method: 'PUT', body: JSON.stringify(stopData) }),
  deleteStop: (id) => request(`/stops/${id}`, { method: 'DELETE' }),
  reorderStops: (sequence) => request('/stops/reorder', { method: 'PUT', body: JSON.stringify(sequence) }),
  
  // External
  geocode: async (name) => {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name)}&format=json&limit=1`, {
      headers: { 'User-Agent': 'FlowlyTravelApp/1.0' }
    });
    return res.json();
  }
};
