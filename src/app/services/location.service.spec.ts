import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { Geolocation } from '@capacitor/geolocation';

import { LocationService, whyUnlocated }
        from './location.service';

vi.mock('@capacitor/geolocation', () => ({
  Geolocation: { getCurrentPosition: vi.fn() },
}));

const getCurrentPosition =
  vi.mocked(Geolocation.getCurrentPosition);

describe('LocationService', () => {
  let service: LocationService;

  beforeEach(() => {
    getCurrentPosition.mockReset();
    service = TestBed.inject(LocationService);
  });

  it('does not ask for the position before it is needed',
     () => {
    expect(getCurrentPosition).not.toHaveBeenCalled();
  });

  it('hands back where the device is', async () => {
    getCurrentPosition.mockResolvedValue({
      timestamp: 0,
      coords: {
        latitude: 50.735,
        longitude: 7.103,
        accuracy: 1200,
        altitude: null,
        altitudeAccuracy: null,
        speed: null,
        heading: null,
        magneticHeading: null,
        trueHeading: null,
        headingAccuracy: null,
        course: null,
      },
    });

    expect(await service.locate()).toEqual({
      found: true,
      here: { lat: 50.735, lng: 7.103 },
    });
  });

  it('asks for a coarse position, with a time limit',
     async () => {
    getCurrentPosition.mockRejectedValue(new Error('no'));

    await service.locate();

    expect(getCurrentPosition).toHaveBeenCalledWith(
      expect.objectContaining({
        enableHighAccuracy: false,
        timeout: expect.any(Number),
      }),
    );
  });

  it('turns a refusal into a reason instead of throwing',
     async () => {
    getCurrentPosition.mockRejectedValue({
      code: 'OS-PLUG-GLOC-0003',
      message: 'Location permission request was denied.',
    });

    expect(await service.locate())
      .toEqual({ found: false, reason: 'denied' });
  });

  it('turns any other failure into a reason as well',
     async () => {
    getCurrentPosition.mockRejectedValue(
      new TypeError('navigator.geolocation is undefined'),
    );

    expect(await service.locate())
      .toEqual({ found: false, reason: 'failed' });
  });
});

describe('whyUnlocated', () => {
  it('reads a denial on iOS and Android', () => {
    expect(whyUnlocated({ code: 'OS-PLUG-GLOC-0003' }))
      .toBe('denied');
  });

  it('reads a restriction on iOS as a denial', () => {
    expect(whyUnlocated({ code: 'OS-PLUG-GLOC-0008' }))
      .toBe('denied');
  });

  it('reads a denial in the browser', () => {
    expect(whyUnlocated({ code: 1, message: 'User denied' }))
      .toBe('denied');
  });

  it('reads location services that are turned off', () => {
    expect(whyUnlocated({ code: 'OS-PLUG-GLOC-0007' }))
      .toBe('off');
    expect(whyUnlocated({ code: 'OS-PLUG-GLOC-0017' }))
      .toBe('off');
  });

  it('calls everything else a failure', () => {
    expect(whyUnlocated({ code: 'OS-PLUG-GLOC-0010' }))
      .toBe('failed');
    expect(whyUnlocated({ code: 3 })).toBe('failed');
    expect(whyUnlocated(new Error('boom'))).toBe('failed');
    expect(whyUnlocated(null)).toBe('failed');
    expect(whyUnlocated(undefined)).toBe('failed');
  });
});
