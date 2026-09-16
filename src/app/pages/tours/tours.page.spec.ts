import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { vi } from 'vitest';
import { provideRouter } from '@angular/router';

import { ToursPage } from './tours.page';
import { TourService } from '../../services/tour.service';
import { FavoritesService }
        from '../../services/favorites.service';
import { Located, LocationService }
        from '../../services/location.service';
import { Tour } from '../../models/tour';

const tour = (id: string, lat: number, lng: number): Tour => ({
  id,
  title: `Tour ${id}`,
  summary: '',
  imageUrl: '',
  thumbnailUrl: '',
  duration: 60,
  maxPersons: 20,
  price: 90,
  priceForeign: 110,
  startingPoint: { lat, lng, location: '' },
});

// In catalog order: Cologne, the Drachenfels, Bonn market.
const catalog = [
  tour('cologne', 50.941278, 6.958281),
  tour('drachenfels', 50.665, 7.21),
  tour('markt', 50.735027, 7.10314),
];

const atTheMarket: Located = {
  found: true,
  here: { lat: 50.7351, lng: 7.1031 },
};

describe('ToursPage, sorted by distance', () => {
  let locate: ReturnType<typeof vi.fn<() => Promise<Located>>>;

  beforeEach(() => {
    locate = vi.fn(async () => atTheMarket);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: TourService,
          useValue: {
            all: () => signal(catalog),
            firstLoad: signal(false),
            isLoading: signal(false),
            error: signal(undefined),
            regions: signal([]),
            tourTypes: signal([]),
            narrowTo: () => undefined,
            reload: () => undefined,
          },
        },
        {
          provide: FavoritesService,
          useValue: { all: signal(['markt', 'cologne']) },
        },
        {
          provide: LocationService,
          useValue: { locate: () => locate() },
        },
      ],
    });
  });

  const open = async () => {
    const fixture = TestBed.createComponent(ToursPage);
    await fixture.whenStable();
    return fixture;
  };

  const titles = (fixture: { nativeElement: HTMLElement }) =>
    Array.from(
      fixture.nativeElement.querySelectorAll('ion-item h2'),
      (h2) => h2.textContent?.trim(),
    );

  it('shows the catalog order and does not ask where the '
     + 'user is', async () => {
    const fixture = await open();

    expect(titles(fixture)).toEqual(
      ['Tour cologne', 'Tour drachenfels', 'Tour markt']);
    expect(locate).not.toHaveBeenCalled();
  });

  it('puts the nearest tour first once chosen', async () => {
    const fixture = await open();

    await fixture.componentInstance.setSort('distance');
    await fixture.whenStable();

    expect(locate).toHaveBeenCalledTimes(1);
    expect(titles(fixture)).toEqual(
      ['Tour markt', 'Tour drachenfels', 'Tour cologne']);
  });

  it('shows how far away each tour starts', async () => {
    const fixture = await open();

    await fixture.componentInstance.setSort('distance');
    await fixture.whenStable();

    const distances = fixture.componentInstance.rows()
      .map((row) => row.distance);
    expect(distances).toEqual(['0 km', '11 km', '25 km']);
    expect(fixture.nativeElement.textContent)
      .toContain('11 km away');
  });

  it('sorts the favorites too', async () => {
    const fixture = await open();
    const page = fixture.componentInstance;

    page.setView('favorites');
    await page.setSort('distance');
    await fixture.whenStable();

    expect(titles(fixture))
      .toEqual(['Tour markt', 'Tour cologne']);
  });

  const planButton = (fixture: { nativeElement: HTMLElement }) =>
    fixture.nativeElement
      .querySelector('ion-button[routerLink="/plan"]');

  it('offers to plan a day from two favorites', async () => {
    const fixture = await open();

    expect(planButton(fixture)).toBe(null);

    fixture.componentInstance.setView('favorites');
    await fixture.whenStable();

    expect(planButton(fixture)?.textContent)
      .toContain('Plan My Day');
  });

  it('offers no day for a single favorite', async () => {
    TestBed.overrideProvider(FavoritesService, {
      useValue: { all: signal(['markt']) },
    });
    const fixture = await open();

    fixture.componentInstance.setView('favorites');
    await fixture.whenStable();

    expect(planButton(fixture)).toBe(null);
  });

  it('goes back to catalog order when asked', async () => {
    const fixture = await open();
    const page = fixture.componentInstance;

    await page.setSort('distance');
    await fixture.whenStable();
    page.setSort('catalog');
    await fixture.whenStable();

    expect(titles(fixture)).toEqual(
      ['Tour cologne', 'Tour drachenfels', 'Tour markt']);
    expect(fixture.nativeElement.textContent)
      .not.toContain('away');
  });

  it('keeps the list usable and says why when the location '
     + 'is refused', async () => {
    locate.mockResolvedValue({ found: false, reason: 'denied' });
    const fixture = await open();
    const page = fixture.componentInstance;

    await page.setSort('distance');
    await fixture.whenStable();

    expect(page.sort()).toBe('catalog');
    expect(titles(fixture)).toEqual(
      ['Tour cologne', 'Tour drachenfels', 'Tour markt']);
    const status = fixture.nativeElement
      .querySelector('[role="status"]');
    expect(status?.textContent)
      .toContain('Sorting by distance needs your location');
  });

  it('says so when location services are off', async () => {
    locate.mockResolvedValue({ found: false, reason: 'off' });
    const fixture = await open();

    await fixture.componentInstance.setSort('distance');
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent)
      .toContain('Location services are turned off');
  });

  it('ignores a location that arrives after the user went '
     + 'back to catalog order', async () => {
    let answer: (located: Located) => void = () => undefined;
    locate.mockReturnValue(
      new Promise<Located>((resolve) => (answer = resolve)));
    const fixture = await open();
    const page = fixture.componentInstance;

    const lookup = page.setSort('distance');
    expect(page.locating()).toBe(true);
    page.setSort('catalog');
    answer(atTheMarket);
    await lookup;
    await fixture.whenStable();

    expect(page.locating()).toBe(false);
    expect(page.sort()).toBe('catalog');
    expect(titles(fixture)).toEqual(
      ['Tour cologne', 'Tour drachenfels', 'Tour markt']);
  });
});
