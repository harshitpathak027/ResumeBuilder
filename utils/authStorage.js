import { Platform } from 'react-native';

const TOKEN_KEY = 'rb_auth_token';
const USER_KEY = 'rb_auth_user';

let memoryToken = null;
let memoryUser = null;

const isWeb = Platform.OS === 'web';

export const setAuthSession = async ({ token, user }) => {
  if (!token) return;

  if (isWeb && typeof window !== 'undefined') {
    window.localStorage.setItem(TOKEN_KEY, token);
    if (user) {
      window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    return;
  }

  memoryToken = token;
  memoryUser = user || null;
};

export const getAuthToken = async () => {
  if (isWeb && typeof window !== 'undefined') {
    return window.localStorage.getItem(TOKEN_KEY);
  }
  return memoryToken;
};

export const getAuthUser = async () => {
  if (isWeb && typeof window !== 'undefined') {
    const raw = window.localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return memoryUser;
};

export const clearAuthSession = async () => {
  if (isWeb && typeof window !== 'undefined') {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    return;
  }

  memoryToken = null;
  memoryUser = null;
};
