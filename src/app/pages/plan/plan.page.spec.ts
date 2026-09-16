import { TestBed } from '@angular/core/testing';
import { LOCALE_ID, signal } from '@angular/core';
import { vi } from 'vitest';
import axe from 'axe-core';
import { provideRouter } from '@angular/router';
import { Share } from '@capacitor/share';

import { PlanPage } from './plan.page';
import { TourService } from '../../services/tour.service';
import { FavoritesService }
        from '../../services/favorites.service';
import { Tour } from '../../models/tour';

vi.mock('@capacitor/share', () => ({
  Share: { canShare: vi.fn(), share: vi.fn() },
}));

const canShare = vi.mocked(Share.canShare);
const share = vi.mocked(Share.share);

const tour = (id: string, title: string, duration: number,
              lat: number, lng: number,
              location: string): Tour => ({
  id,
  title,
  summary: '',
  imageUrl: '',
  thumbnailUrl: '',
  duration,
  maxPersons: 20,
  price: 90,
  priceForeign: 110,
  startingPoint: { lat, lng, location },
});

// The market and the station are 0.6 km apart, the
// Drachenfels is 11 km from the market.
const catalog = [
  tour('markt', 'Round Trip Bonn', 60,
       50.735027, 7.10314, 'Markt 2, 53111 Bonn'),
  tour('station', 'Bonn by Bike', 90,
       50.732, 7.096, 'Hauptbahnhof, Bonn'),
  tour('drachenfels', 'Up the Drachenfels', 120,
       50.665, 7.21, 'Drachenfelsstraße, Königswinter'),
];

describe('PlanPage', () => {
  let favorites: ReturnType<typeof signal<string[]>>;

  beforeEach(() => {
    canShare.mockReset();
    share.mockReset();
    canShare.mockResolvedValue({ value: true });
    share.mockResolvedValue({});
    favorites = signal(['markt', 'station']);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        // The app in German: a day on a 24 hour clock.
        { provide: LOCALE_ID, useValue: 'de' },
        {
          provide: TourService,
          useValue: {
            firstLoad: signal(false),
            byId: (id: string) =>
              catalog.find((t) => t.id === id),
          },
        },
        {
          provide: FavoritesService,
          useValue: { all: favorites },
        },
      ],
    });
  });

  const open = async () => {
    const fixture = TestBed.createComponent(PlanPage);
    await fixture.whenStable();
    return fixture;
  };

  const text = (fixture: { nativeElement: HTMLElement }) =>
    fixture.nativeElement.textContent ?? '';

  const titles = (fixture: { nativeElement: HTMLElement }) =>
    Array.from(
      fixture.nativeElement
        .querySelectorAll('ion-reorder-group ion-label'),
      (label) => label.textContent?.trim(),
    );

  it('starts today at ten, without the bus and with lunch',
     async () => {
    const page = (await open()).componentInstance;

    expect(page.startTime()).toBe('10:00');
    expect(page.bus()).toBe(false);
    expect(page.lunch()).toBe(true);
    expect(page.date()).toBe(page.today);
  });

  it('cannot be planned for a day in the past', async () => {
    const fixture = await open();
    const root: HTMLElement = fixture.nativeElement;
    const picker = root.querySelector('ion-datetime#planDate');

    expect((picker as unknown as { min?: string })?.min)
      .toBe(fixture.componentInstance.today);
  });

  it('plans the tours in the order they became favorites',
     async () => {
    const fixture = await open();

    expect(titles(fixture))
      .toEqual(['Round Trip Bonn', 'Bonn by Bike']);
    expect(text(fixture)).toContain('10:00 – 11:00');
    // 0.6 km on foot, rounded up to ten minutes.
    expect(text(fixture)).toContain('On foot');
    expect(text(fixture)).toContain('10 min · 0,6 km');
    expect(text(fixture)).toContain('11:10 – 12:40');
  });

  it('replans at once when the order changes', async () => {
    const fixture = await open();

    fixture.componentInstance.move(0, 1);
    await fixture.whenStable();

    expect(titles(fixture))
      .toEqual(['Bonn by Bike', 'Round Trip Bonn']);
    // The ninety minute tour runs first now, and its end at
    // 11:30 makes room for lunch.
    expect(text(fixture)).toContain('10:00 – 11:30');
    expect(text(fixture)).toContain('12:40 – 13:40');
  });

  it('follows a favorite that is taken away', async () => {
    const fixture = await open();

    favorites.set(['markt']);
    await fixture.whenStable();

    expect(text(fixture))
      .toContain('A day needs at least two favorite tours');
    expect(text(fixture)).not.toContain('10:00');
  });

  it('keeps the hand-made order when a favorite goes and '
     + 'puts a new one at the end', async () => {
    const fixture = await open();
    const page = fixture.componentInstance;

    page.move(0, 1);
    favorites.set(['markt', 'station', 'drachenfels']);
    await fixture.whenStable();

    expect(page.tours().map((t) => t.id))
      .toEqual(['station', 'markt', 'drachenfels']);
  });

  it('asks for the bus when a leg is too far to walk',
     async () => {
    favorites.set(['markt', 'drachenfels']);
    const fixture = await open();

    expect(text(fixture)).toContain('Too far to walk');
    const alert = fixture.nativeElement
      .querySelector('[role="alert"]');
    expect(alert?.textContent)
      .toContain('Turn on the bus transfer');
  });

  it('shows no times from the leg that is too far on',
     async () => {
    favorites.set(['markt', 'drachenfels']);
    const fixture = await open();

    expect(text(fixture)).toContain('10:00 – 11:00');
    // Nothing after the first tour has a time.
    const root: HTMLElement = fixture.nativeElement;
    const times = Array.from(
      root.querySelectorAll('.step ion-note'),
      (note) => note.textContent?.trim(),
    );
    expect(times).toEqual(['10:00 – 11:00', '', '']);
  });

  it('drives the same leg once the bus is on', async () => {
    favorites.set(['markt', 'drachenfels']);
    const fixture = await open();

    fixture.componentInstance.bus.set(true);
    await fixture.whenStable();

    expect(text(fixture)).not.toContain('Too far to walk');
    expect(text(fixture)).toContain('By bus');
    expect(text(fixture)).toContain('45 min · 11 km');
    expect(text(fixture)).toContain('11:45 – 13:45');
  });

  it('breaks for lunch and offers a map search there',
     async () => {
    favorites.set(['station', 'markt']);
    const fixture = await open();
    const opened = vi.spyOn(window, 'open')
      .mockReturnValue(null);

    // The first tour ends at 11:30, so lunch follows it and
    // the leg to the next tour waits for it.
    expect(text(fixture)).toContain('Lunch break');
    expect(text(fixture)).toContain('11:30 – 12:30');
    expect(text(fixture)).toContain('12:30 – 12:40');
    expect(text(fixture)).toContain('Places to eat nearby');

    fixture.nativeElement
      .querySelector('ion-button.eat')
      .click();

    expect(opened).toHaveBeenCalledTimes(1);
    expect(String(opened.mock.calls[0][0]))
      .toContain('Restaurants');
    // Where the tour before it ended.
    expect(String(opened.mock.calls[0][0]))
      .toContain('50.732,7.096');
    opened.mockRestore();
  });

  it('says when there is no room for lunch', async () => {
    const fixture = await open();
    const page = fixture.componentInstance;

    // 13:10 to 14:10 and 14:20 to 15:50: the day runs into
    // the lunch window without ending inside it.
    page.setStart('13:10');
    await fixture.whenStable();

    expect(text(fixture))
      .toContain('there is no room for a lunch break');

    page.lunch.set(false);
    await fixture.whenStable();

    expect(text(fixture))
      .not.toContain('there is no room for a lunch break');
  });

  it('warns about a day that ends after 20:00', async () => {
    const fixture = await open();

    fixture.componentInstance.setStart('18:00');
    await fixture.whenStable();

    expect(text(fixture))
      .toContain('The last tour ends at 20:40, after 20:00');
  });

  it('shares the plan with its tours, legs and lunch',
     async () => {
    favorites.set(['station', 'markt']);
    const fixture = await open();

    await fixture.componentInstance.share();

    expect(share).toHaveBeenCalledTimes(1);
    const shared = share.mock.calls[0][0].text ?? '';
    expect(shared.split('\n')).toEqual([
      'Plan My Day',
      expect.stringContaining(', from 10:00'),
      '10:00 – 11:30 — Bonn by Bike (90 min)',
      '11:30 – 12:30 — Lunch break (60 min)',
      '12:30 – 12:40 — On foot (10 min · 0,6 km)',
      '12:40 – 13:40 — Round Trip Bonn (60 min)',
    ]);
  });

  it('keeps quiet where the device cannot share',
     async () => {
    canShare.mockResolvedValue({ value: false });
    const fixture = await open();

    expect(fixture.componentInstance.canShare()).toBe(false);
    expect(fixture.nativeElement.querySelector(
      'ion-button[aria-label="Share this plan"]')).toBe(null);
  });

  it('stays on its feet when sharing fails', async () => {
    share.mockRejectedValue(new Error('canceled'));
    const fixture = await open();

    await expect(fixture.componentInstance.share())
      .resolves.toBeUndefined();
  });

  it('tells the time the way the language does', async () => {
    TestBed.overrideProvider(LOCALE_ID, { useValue: 'en' });
    const fixture = await open();

    expect(text(fixture)).toContain('10:00');
    expect(text(fixture)).toMatch(/10:00\s?AM/);
  });

  it('has no accessibility violations of its own',
     async () => {
    const fixture = await open();

    const context = {
      include: [fixture.nativeElement],
      exclude: [['ion-modal'], ['ion-toggle']],
    };
    const result = await axe.run(context, {
      rules: { 'color-contrast': { enabled: false } },
    });

    expect(result.violations.map((v) => v.id)).toEqual([]);
  });
});
