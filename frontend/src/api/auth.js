import { apiRequest, jsonOptions, setToken, clearToken } from './client';

export async function register(payload) {
  const data = await apiRequest('/auth/register', jsonOptions('POST', payload));
  setToken(data.access_token);
  return data;
}

export async function login(payload) {
  const data = await apiRequest('/auth/login', jsonOptions('POST', payload));
  setToken(data.access_token);
  return data;
}

export function logout() {
  clearToken();
}

export function me() {
  return apiRequest('/auth/me');
}
