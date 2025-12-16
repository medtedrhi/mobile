import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';
import * as apiAuth from '../api/auth';

type User = { id?: number; name?: string; email?: string; role?: string } | null;

type AuthContextType = {
  user: User;
  token: string | null;
  loading: boolean;
  userFetchComplete: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const c = useContext(AuthContext);
  if (!c) throw new Error('useAuth must be used within AuthProvider');
  return c;
};

const TOKEN_KEY = 'jwt_token';

export const AuthProvider: React.FC<any> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const [userFetchComplete, setUserFetchComplete] = useState(false);

  async function loadFromStorage() {
    setLoading(true);
    try {
      const t = await AsyncStorage.getItem(TOKEN_KEY);
      if (t) {
        setToken(t);
        await fetchMe(t);
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function fetchMe(t?: string): Promise<User> {
    const usedToken = t ?? token;
    if (!usedToken) {
      setUser(null);
      setUserFetchComplete(true);
      return null;
    }
    let fetchedUser: User = null;
    try {
      const res = await fetch(`${API_BASE_URL}/me`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${usedToken}` },
      });
      if (!res.ok) throw new Error('Unauthenticated');
      const data = await res.json();
      fetchedUser = data && typeof data === 'object' ? (data.user || data) : null;
      setUser(fetchedUser);
    } catch (e) {
      setUser(null);
    } finally {
      setUserFetchComplete(true);
    }
    return fetchedUser;
  }

  useEffect(() => {
    loadFromStorage();
  }, []);

  async function login(email: string, password: string): Promise<User> {
    setLoading(true);
    setUserFetchComplete(false);
    let loginUser: User = null;
    try {
      const data = await apiAuth.login(email, password);
      const t = (data && typeof data === 'object') ? (data.token || data.access_token) : null;
      if (t && typeof t === 'string') {
        await AsyncStorage.setItem(TOKEN_KEY, t);
        setToken(t);
        // Try to fetch user; if it fails, use the user data from the login response as fallback
        loginUser = await fetchMe(t);
        if (!loginUser && data?.user) {
          // Fallback: use user from login response if fetchMe failed
          loginUser = data.user;
          setUser(loginUser);
        }
      } else {
        // If no token from login response, try fetchMe (shouldn't happen)
        loginUser = await fetchMe();
      }
    } catch (e: any) {
      console.error('Login error in AuthContext:', e);
      throw e;
    } finally {
      setLoading(false);
    }
    return loginUser;
  }

  async function logout() {
    await apiAuth.logout();
    setToken(null);
    setUser(null);
  }

  async function refresh() {
    setLoading(true);
    try {
      await fetchMe();
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, userFetchComplete, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
