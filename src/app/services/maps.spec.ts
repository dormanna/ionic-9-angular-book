import { vi } from 'vitest';
import { Capacitor } from '@capacitor/core';

import { mapSearchUrl, openMapSearch } from './maps';

vi.mock('@capacitor/core', () => ({
  Capacitor: { getPlatform: vi.fn() },
}));

const getPlatform = vi.mocked(Capacitor.getPlatform);

const markt = {
  lat: 50.735027,
  lng: 7.10314,
  location: 'Markt 2, 53111 Bonn',
};

describe('mapSearchUrl', () => {
  it('searches Google Maps for the coordinates on Android',
     () => {
    expect(mapSearchUrl('android', markt)).toBe(
      'https://www.google.com/maps/search/?api=1'
      + '&query=50.735027%2C7.10314');
  });

  it('searches Apple Maps at the coordinates elsewhere',
     () => {
    expect(mapSearchUrl('ios', markt)).toBe(
      'https://maps.apple.com/?ll=50.735027,7.10314'
      + '&q=Markt%202%2C%2053111%20Bonn');
    expect(mapSearchUrl('web', markt))
      .toBe(mapSearchUrl('ios', markt));
  });

  it('looks for a term around the place when given one',
     () => {
    expect(mapSearchUrl('android', markt, 'Restaurants'))
      .toContain('query=Restaurants%2050.735027%2C7.10314');
    expect(mapSearchUrl('ios', markt, 'Restaurants'))
      .toBe('https://maps.apple.com/?ll=50.735027,7.10314'
            + '&q=Restaurants');
  });
});

describe('openMapSearch', () => {
  it('opens the map of the platform it runs on', () => {
    getPlatform.mockReturnValue('android');
    const open = vi.spyOn(window, 'open')
      .mockReturnValue(null);

    openMapSearch(markt, 'Restaurants');

    expect(open).toHaveBeenCalledWith(
      mapSearchUrl('android', markt, 'Restaurants'),
      '_blank',
    );
    open.mockRestore();
  });
});
