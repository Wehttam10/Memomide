const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token) {
  localStorage.setItem('token', token);
}

export function clearToken() {
  localStorage.removeItem('token');
}

export async function apiRequest(path, options = {}) {
  const response = await apiResponse(path, options);
  if (response.status === 204) return null;
  return response.data;
}

export async function apiResponse(path, options = {}) {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (response.status === 204) return { data: null, response };
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401) {
      clearToken();
      if (!window.location.pathname.includes('/login')) {
        window.location.assign('/login');
      }
    }
    throw new Error(data?.detail || 'Request failed');
  }
  return { data, response };
}

export function jsonOptions(method, body) {
  return { method, body: JSON.stringify(body) };
}
