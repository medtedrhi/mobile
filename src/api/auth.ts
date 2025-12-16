import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

const TOKEN_KEY = 'jwt_token';

export async function saveToken(token: string) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  // backend returns an object like { user: {...}, token: '...'}
  const token = (data && typeof data === 'object') ? (data.token || data.access_token) : data;
  if (!token || typeof token !== 'string') throw new Error('No token returned');
  await saveToken(token);
  return data;
}

export async function register(payload: any) {
  const res = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  const token = (data && typeof data === 'object') ? (data.token || data.access_token) : data;
  if (token && typeof token === 'string') await saveToken(token);
  return data;
}

export async function logout() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}
