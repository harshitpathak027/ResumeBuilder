import Constants from 'expo-constants';
import { Platform } from 'react-native';

export const API_URLS = {
  LOCAL_WEB: "http://localhost:8080",
  LOCAL_ANDROID_EMULATOR: "http://10.0.2.2:8080",
  LOCAL_MOBILE_LAN: "http://192.168.1.100:8080",
  ANDROID_EMULATOR: "http://10.0.2.2:8080",
  PRODUCTION: "https://resumebuilderapi.mooo.com",
};

const LOCAL_API_BASE_URL = Platform.select({
  web: API_URLS.LOCAL_WEB,
  android: API_URLS.LOCAL_MOBILE_LAN,
  default: API_URLS.LOCAL_MOBILE_LAN,
});

const PRODUCTION_API_BASE_URL = API_URLS.PRODUCTION;

// Use the local backend during development. Switch to PRODUCTION for release builds.
export const API_BASE_URL = PRODUCTION_API_BASE_URL;