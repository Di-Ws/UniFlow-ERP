import { jwtDecode } from 'jwt-decode';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'HOD' | 'FACULTY' | 'STUDENT';
}

interface DecodedToken {
  id: number;
  exp: number;
}

export const setAuthData = (token: string, user: User) => {
  localStorage.setItem('accessToken', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuthData = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
};

export const getToken = () => localStorage.getItem('accessToken');

export const getUser = (): User | null => {
  const userJson = localStorage.getItem('user');
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
};

export const getUserRole = () => {
  const user = getUser();
  return user?.role || null;
};

export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;

  try {
    const decoded: DecodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    // Check if token is expired
    if (decoded.exp < currentTime) {
      clearAuthData();
      return false;
    }
    return true;
  } catch {
    clearAuthData();
    return false;
  }
};

export const logout = () => {
  clearAuthData();
  window.location.href = '/login';
};

// Check for token expiry every minute
export const startAutoLogoutCheck = () => {
  setInterval(() => {
    if (!isAuthenticated() && getToken()) {
      logout();
    }
  }, 60000);
};
