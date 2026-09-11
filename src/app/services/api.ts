import { Capacitor } from '@capacitor/core';

// Served from the same origin as the API, a path is enough.
// Inside a native shell the app is loaded from capacitor://
// localhost or https://localhost, and the API is elsewhere.
const base = Capacitor.isNativePlatform()
  ? 'https://api.bob-tours.example'
  : '';

export const apiUrl = (path: string) => `${base}${path}`;
