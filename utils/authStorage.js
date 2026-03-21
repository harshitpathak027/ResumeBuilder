import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'rb_auth_token';
const USER_KEY = 'rb_auth_user';

const isWeb = Platform.OS === 'web';

export const setAuthSession = async ({ token, user }) => {
  if (!token) return;

  try {
    if (isWeb && typeof window !== 'undefined') {
      window.localStorage.setItem(TOKEN_KEY, token);
      if (user) {
        window.localStorage.setItem(USER_KEY, JSON.stringify(user));
      }
    } else {
      // Native: Use SecureStore for persistent storage
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      if (user) {
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
      }
    }
  } catch (error) {
    console.error('Error saving auth session:', error);
  }
};

export const getAuthToken = async () => {
  try {
    if (isWeb && typeof window !== 'undefined') {
      return window.localStorage.getItem(TOKEN_KEY);
    } else {
      // Native: Retrieve from SecureStore
      return await SecureStore.getItemAsync(TOKEN_KEY);
    }
  } catch (error) {
    console.error('Error retrieving auth token:', error);
    return null;
  }
};

export const getAuthUser = async () => {
  try {
    if (isWeb && typeof window !== 'undefined') {
      const raw = window.localStorage.getItem(USER_KEY);
      if (!raw) return null;
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    } else {
      // Native: Retrieve from SecureStore
      const raw = await SecureStore.getItemAsync(USER_KEY);
      if (!raw) return null;
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
  } catch (error) {
    console.error('Error retrieving auth user:', error);
    return null;
  }
};

export const clearAuthSession = async () => {
  try {
    if (isWeb && typeof window !== 'undefined') {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(USER_KEY);
    } else {
      // Native: Remove from SecureStore
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
    }
  } catch (error) {
    console.error('Error clearing auth session:', error);
  }
};
