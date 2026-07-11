const BASE = import.meta.env.VITE_API_URL || '';

function getToken() {
  return localStorage.getItem('nrc_token');
}

function setToken(token) {
  localStorage.setItem('nrc_token', token);
}

function clearToken() {
  localStorage.removeItem('nrc_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Server error (${res.status}): Backend may be offline`);
  }
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  // Auth
  login: (username, password) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }).then((r) => {
      setToken(r.token);
      return r;
    }),

  register: (username, password, role) =>
    request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, role }),
    }),

  logout: () => clearToken(),
  getMe: () => request('/api/auth/me'),

  getToken,
  setToken,
  clearToken,

  // Dashboard
  getStats: () => request('/api/dashboard/stats'),
  getActivity: () => request('/api/dashboard/activity'),

  // Trucks
  getTrucks: (status) =>
    request(`/api/trucks${status ? `?status=${status}` : ''}`),
  getLiveTrucks: () => request('/api/trucks/live'),
  getTruck: (id) => request(`/api/trucks/${id}`),
  createTruck: (data) =>
    request('/api/trucks', { method: 'POST', body: JSON.stringify(data) }),
  updateTruck: (id, data) =>
    request(`/api/trucks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTruck: (id) =>
    request(`/api/trucks/${id}`, { method: 'DELETE' }),

  // Drivers
  getDrivers: () => request('/api/drivers'),
  createDriver: (data) =>
    request('/api/drivers', { method: 'POST', body: JSON.stringify(data) }),
  updateDriver: (id, data) =>
    request(`/api/drivers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDriver: (id) =>
    request(`/api/drivers/${id}`, { method: 'DELETE' }),

  // Routes
  getRoutes: (status) =>
    request(`/api/routes${status ? `?status=${status}` : ''}`),
  getRoute: (id) => request(`/api/routes/${id}`),
  createRoute: (data) =>
    request('/api/routes', { method: 'POST', body: JSON.stringify(data) }),
  updateRoute: (id, data) =>
    request(`/api/routes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRoute: (id) =>
    request(`/api/routes/${id}`, { method: 'DELETE' }),

  // Location
  sendLocation: (data) =>
    request('/api/location', { method: 'POST', body: JSON.stringify(data) }),
  getLocationHistory: (truckId, limit) =>
    request(`/api/location/${truckId}${limit ? `?limit=${limit}` : ''}`),

  // Reports
  getTripReport: (days) => request(`/api/reports/trips?days=${days || 7}`),
  getTruckReport: (truckId, days) =>
    request(`/api/reports/truck/${truckId}?days=${days || 7}`),
};
