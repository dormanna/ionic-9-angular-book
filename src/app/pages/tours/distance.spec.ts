import { distanceInKm, formatDistance, nearestFirst }
        from './distance';

const markt = { lat: 50.735027, lng: 7.10314 };
const drachenfels = { lat: 50.665, lng: 7.21 };
const cologneCathedral = { lat: 50.941278, lng: 6.958281 };

const tour = (id: string, lat: number, lng: number) => ({
  id,
  startingPoint: { lat, lng },
});

describe('distanceInKm', () => {
  it('is zero from a place to itself', () => {
    expect(distanceInKm(markt, markt)).toBe(0);
  });

  it('measures Bonn to Cologne as about 25 km', () => {
    expect(distanceInKm(markt, cologneCathedral))
      .toBeCloseTo(25.0, 0);
  });

  it('is the same in both directions', () => {
    expect(distanceInKm(markt, drachenfels))
      .toBeCloseTo(distanceInKm(drachenfels, markt), 9);
  });

  it('measures a degree of latitude as about 111 km', () => {
    expect(distanceInKm({ lat: 50, lng: 7 },
                        { lat: 51, lng: 7 }))
      .toBeCloseTo(111.2, 1);
  });
});

describe('nearestFirst', () => {
  it('puts the nearest starting point first', () => {
    const tours = [
      tour('cologne', cologneCathedral.lat,
           cologneCathedral.lng),
      tour('drachenfels', drachenfels.lat, drachenfels.lng),
      tour('markt', markt.lat, markt.lng),
    ];

    const sorted = nearestFirst(tours, markt);

    expect(sorted.map((placed) => placed.tour.id))
      .toEqual(['markt', 'drachenfels', 'cologne']);
    expect(sorted[0].km).toBe(0);
  });

  it('keeps the catalog order for equal distances', () => {
    const tours = [
      tour('b', markt.lat, markt.lng),
      tour('a', markt.lat, markt.lng),
      tour('c', markt.lat, markt.lng),
    ];

    expect(nearestFirst(tours, drachenfels)
      .map((placed) => placed.tour.id))
      .toEqual(['b', 'a', 'c']);
  });

  it('puts a tour without coordinates last', () => {
    const tours = [
      tour('nowhere', NaN, NaN),
      tour('cologne', cologneCathedral.lat,
           cologneCathedral.lng),
      tour('markt', markt.lat, markt.lng),
    ];

    expect(nearestFirst(tours, markt)
      .map((placed) => placed.tour.id))
      .toEqual(['markt', 'cologne', 'nowhere']);
  });

  it('leaves the list it was given alone', () => {
    const tours = [
      tour('cologne', cologneCathedral.lat,
           cologneCathedral.lng),
      tour('markt', markt.lat, markt.lng),
    ];

    nearestFirst(tours, markt);

    expect(tours.map((t) => t.id))
      .toEqual(['cologne', 'markt']);
  });

  it('returns nothing for no tours', () => {
    expect(nearestFirst([], markt)).toEqual([]);
  });
});

describe('formatDistance', () => {
  it('shows one decimal below ten kilometers', () => {
    expect(formatDistance(2.44, 'en')).toBe('2.4 km');
    expect(formatDistance(2.44, 'de')).toBe('2,4 km');
  });

  it('shows whole kilometers from ten on', () => {
    expect(formatDistance(24.97, 'en')).toBe('25 km');
  });

  it('drops a decimal that is zero', () => {
    expect(formatDistance(0, 'en')).toBe('0 km');
  });
});
