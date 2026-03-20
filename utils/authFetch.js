import { getAuthToken } from './authStorage';

export const authFetch = async (url, options = {}) => {
  const token = await getAuthToken();

  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
};
