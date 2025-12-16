import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

async function authHeaders() {
  const token = await AsyncStorage.getItem('jwt_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path: string, options: RequestInit = {}) {
  const headers = Object.assign({ 'Content-Type': 'application/json' }, await authHeaders(), options.headers || {});
  const res = await fetch(`${API_BASE_URL}${path}`, Object.assign({}, options, { headers }));
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const err: any = new Error(`HTTP ${res.status}`);
    err.status = res.status;
    try { err.body = JSON.parse(body); } catch { err.body = body; }
    throw err;
  }
  return res.json().catch(() => null);
}

export const api = {
  get: (path: string) => request(path, { method: 'GET' }),
  post: (path: string, body: any) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path: string, body: any) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: (path: string) => request(path, { method: 'DELETE' }),
};

export default api;
