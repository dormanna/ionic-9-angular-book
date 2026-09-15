export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Placed<T> {
  tour: T;
  km: number;
}

const EARTH_RADIUS_KM = 6371;

const radians = (degrees: number) => (degrees * Math.PI) / 180;

// The great-circle distance, by the haversine formula.
export function distanceInKm(from: Coordinates,
                             to: Coordinates): number {
  const dLat = radians(to.lat - from.lat);
  const dLng = radians(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(from.lat)) *
      Math.cos(radians(to.lat)) *
      Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

// Nearest starting point first. Tours at the same distance
// keep their catalog order, and a tour without a usable
// starting point goes to the end.
export function nearestFirst<
  T extends { startingPoint: Coordinates },
>(tours: readonly T[], here: Coordinates): Placed<T>[] {
  const rank = (km: number) =>
    Number.isFinite(km) ? km : Infinity;
  return tours
    .map((tour) => ({
      tour,
      km: distanceInKm(here, tour.startingPoint),
    }))
    .sort((a, b) => {
      const difference = rank(a.km) - rank(b.km);
      return Number.isNaN(difference) ? 0 : difference;
    });
}

// "2.4 km", "2,4 km", "23 km": a decimal only where it
// still tells the user something.
export function formatDistance(km: number,
                               locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: 'kilometer',
    maximumFractionDigits: km < 10 ? 1 : 0,
  }).format(km);
}
