import { Capacitor } from '@capacitor/core';

export interface MapPlace {
  lat: number;
  lng: number;
  location: string;
}

// Google Maps on Android, Apple Maps everywhere else: a
// search at the place, which both open with a pin and a way
// to get there. With a term it becomes a search for that
// term around the place instead.
export function mapSearchUrl(platform: string,
                             place: MapPlace,
                             term?: string): string {
  const { lat, lng, location } = place;
  if (platform === 'android') {
    const query = term ? `${term} ${lat},${lng}`
                       : `${lat},${lng}`;
    return 'https://www.google.com/maps/search/?api=1'
      + `&query=${encodeURIComponent(query)}`;
  }
  return `https://maps.apple.com/?ll=${lat},${lng}`
    + `&q=${encodeURIComponent(term ?? location)}`;
}

export function openMapSearch(place: MapPlace,
                              term?: string) {
  window.open(
    mapSearchUrl(Capacitor.getPlatform(), place, term),
    '_blank',
  );
}
