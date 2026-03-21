import { Platform } from 'react-native';

export const API_URLS = {
  LOCAL_WEB: "http://localhost:8080",
  LOCAL_ANDROID_EMULATOR: "http://10.0.2.2:8080",
  LOCAL_MOBILE_LAN: "http://192.168.1.100:8080",
  ANDROID_EMULATOR: "http://10.0.2.2:8080",
  PRODUCTION: "https://resumebuilderbackend-production.up.railway.app",
};

const LOCAL_API_BASE_URL = Platform.select({
  web: API_URLS.LOCAL_WEB,
  android: API_URLS.LOCAL_MOBILE_LAN,
  default: API_URLS.LOCAL_MOBILE_LAN,
});

const PRODUCTION_API_BASE_URL = API_URLS.PRODUCTION;

// MANUAL SWITCH:
// Use LOCAL while testing with your own backend on localhost/LAN.
// export const API_BASE_URL = LOCAL_API_BASE_URL;

// Use PRODUCTION for release testing / real users.
export const API_BASE_URL = PRODUCTION_API_BASE_URL;
