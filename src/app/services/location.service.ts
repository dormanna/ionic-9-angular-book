import { Service } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { Coordinates } from '../pages/tours/distance';

export type Unlocated = 'denied' | 'off' | 'failed';

export type Located =
  | { found: true; here: Coordinates }
  | { found: false; reason: Unlocated };

// The native plugin rejects with a code of its own, the web
// with a GeolocationPositionError.
const DENIED = ['OS-PLUG-GLOC-0003', 'OS-PLUG-GLOC-0008'];
const OFF = ['OS-PLUG-GLOC-0007', 'OS-PLUG-GLOC-0017'];
const WEB_PERMISSION_DENIED = 1;

export function whyUnlocated(error: unknown): Unlocated {
  const code = (error as { code?: unknown } | null)?.code;
  if (code === WEB_PERMISSION_DENIED ||
      DENIED.includes(code as string)) {
    return 'denied';
  }
  if (OFF.includes(code as string)) {
    return 'off';
  }
  return 'failed';
}

@Service()
export class LocationService {
  // Asks for the permission on the first call, not before.
  // Tours are kilometers apart, so a coarse position does.
  async locate(): Promise<Located> {
    try {
      const { coords } = await Geolocation.getCurrentPosition({
        enableHighAccuracy: false,
        timeout: 10_000,
        maximumAge: 5 * 60_000,
      });
      return {
        found: true,
        here: { lat: coords.latitude, lng: coords.longitude },
      };
    } catch (error) {
      return { found: false, reason: whyUnlocated(error) };
    }
  }
}
