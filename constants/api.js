import Constants from 'expo-constants';
import { Platform } from 'react-native';

export const API_URLS = {
  LOCAL: "http://localhost:8080",
  ANDROID_EMULATOR: "http://10.0.2.2:8080",
  PRODUCTION: "https://resumebuilderbackend-production.up.railway.app",
};

const ENV_API_URL = (process.env.EXPO_PUBLIC_API_URL || '').trim();

const isLanLikeHost = (host) => {
  if (!host) return false;

  if (host.endsWith('.local')) return true;

  if (/^10\./.test(host)) return true;
  if (/^192\.168\./.test(host)) return true;

  const match = host.match(/^172\.(\d{1,3})\./);
  if (match) {
    const secondOctet = Number(match[1]);
    if (secondOctet >= 16 && secondOctet <= 31) return true;
  }

  return false;
};

const getExpoHost = () => {
  const hostUri =
    Constants?.expoConfig?.hostUri ||
    Constants?.expoGoConfig?.debuggerHost ||
    Constants?.manifest?.debuggerHost ||
    Constants?.manifest2?.extra?.expoClient?.hostUri ||
    null;

  if (!hostUri) return null;
  const host = hostUri.split(":")[0];
  if (!host || host === 'localhost' || host === '127.0.0.1') return null;
  if (!isLanLikeHost(host)) return null;
  return host ? `http://${host}:8080` : null;
};

const mobileDevBaseUrl = ENV_API_URL || getExpoHost() || API_URLS.PRODUCTION;

export const API_BASE_URL = ENV_API_URL || (__DEV__
  ? Platform.OS === 'web'
    ? API_URLS.LOCAL
    : mobileDevBaseUrl
  : API_URLS.PRODUCTION);
