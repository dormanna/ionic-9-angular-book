import { clockMinutes, dayIso, formatClock, formatDay,
         legFor, oneLine, planDay, PlanStep } from './plan';

const at = (lat: number, lng: number, location = '') =>
  ({ lat, lng, location });

// Bonn market and the main station are 0.6 km apart, the
// Drachenfels is about 11 km away from both, and the ferry
// in Königswinter is 2.2 km from the Drachenfels.
const markt = at(50.735027, 7.10314, 'Markt 2, Bonn');
const station = at(50.732, 7.096, 'Hauptbahnhof, Bonn');
const drachenfels = at(50.665, 7.21, 'Drachenfels');
const koenigswinter = at(50.6797, 7.1897, 'Königswinter');

const tour = (
  title: string,
  duration: number,
  startingPoint: { lat: number; lng: number; location: string },
) => ({ title, duration, startingPoint });

const ten = 10 * 60;

const kinds = (steps: PlanStep<unknown>[]) =>
  steps.map((step) => step.kind);

// The steps as "kind start-end", which is what the page
// shows, minutes instead of clock times.
const times = (steps: PlanStep<unknown>[]) =>
  steps.map((step) => `${step.kind} ${step.start}-${step.end}`);

describe('legFor', () => {
  it('walks a short leg at four kilometers an hour', () => {
    expect(legFor(2, false))
      .toEqual({ mode: 'walk', minutes: 30 });
  });

  it('rounds a walk up to five minutes', () => {
    // 0.9 km is 13.5 minutes on foot.
    expect(legFor(0.9, false))
      .toEqual({ mode: 'walk', minutes: 15 });
  });

  it('still walks three kilometers', () => {
    expect(legFor(3, false))
      .toEqual({ mode: 'walk', minutes: 45 });
  });

  it('calls anything longer too far without the bus', () => {
    expect(legFor(3.1, false))
      .toEqual({ mode: 'tooFar', minutes: null });
  });

  it('takes the bus over a kilometer, with a detour and '
     + 'ten minutes at the stops', () => {
    // 10 km as the crow flies is 14 km by road, 28 minutes
    // at 30 km/h, rounded up to 30, plus 10.
    expect(legFor(10, true))
      .toEqual({ mode: 'bus', minutes: 40 });
  });

  it('walks up to a kilometer even with the bus on', () => {
    expect(legFor(1, true))
      .toEqual({ mode: 'walk', minutes: 15 });
    expect(legFor(1.1, true).mode).toBe('bus');
  });
});

describe('planDay, on foot', () => {
  it('runs one tour after the other from the start time',
     () => {
    const plan = planDay(
      [tour('A', 60, markt), tour('B', 90, station)],
      { start: ten, bus: false, lunch: false },
    );

    expect(times(plan.steps)).toEqual([
      'tour 600-660',   // 10:00 to 11:00
      'leg 660-670',    // 10 minutes on foot
      'tour 670-760',   // 11:10 to 12:40
    ]);
    expect(plan.endsAt).toBe(760);
    expect(plan.tooFar).toBe(false);
    expect(plan.late).toBe(false);
  });

  it('has no leg between two tours that start in the same '
     + 'place', () => {
    const plan = planDay(
      [tour('A', 60, markt), tour('B', 60, { ...markt })],
      { start: ten, bus: false, lunch: false },
    );

    expect(kinds(plan.steps)).toEqual(['tour', 'tour']);
    expect(times(plan.steps))
      .toEqual(['tour 600-660', 'tour 660-720']);
  });

  it('warns about a day that ends after 20:00', () => {
    const plan = planDay(
      [tour('A', 540, markt), tour('B', 60, station)],
      { start: ten, bus: false, lunch: false },
    );

    // 10:00 plus nine hours, ten minutes on foot and an
    // hour: 20:10.
    expect(plan.endsAt).toBe(20 * 60 + 10);
    expect(plan.late).toBe(true);
  });

  it('plans nothing out of no tours', () => {
    const plan = planDay([], {
      start: ten, bus: false, lunch: true,
    });

    expect(plan.steps).toEqual([]);
    expect(plan.endsAt).toBe(null);
    expect(plan.noLunchRoom).toBe(false);
    expect(plan.late).toBe(false);
  });
});

describe('planDay, with a leg too far to walk', () => {
  const tours = [
    tour('A', 60, markt),
    tour('B', 60, drachenfels),
    tour('C', 60, koenigswinter),
  ];

  it('marks the leg and drops the times from there on',
     () => {
    const plan = planDay(tours, {
      start: ten, bus: false, lunch: false,
    });

    expect(plan.tooFar).toBe(true);
    expect(times(plan.steps)).toEqual([
      'tour 600-660',
      'leg null-null',
      'tour null-null',
      'leg null-null',
      'tour null-null',
    ]);
    expect(plan.steps[1]).toMatchObject({
      mode: 'tooFar',
      minutes: null,
    });
    // The part with times ends with the first tour.
    expect(plan.endsAt).toBe(660);
  });

  it('still says how the later legs would be covered',
     () => {
    const plan = planDay(tours, {
      start: ten, bus: false, lunch: false,
    });

    // The 2.2 km from the Drachenfels to Königswinter are
    // a walk, only one without a time.
    expect(plan.steps[3]).toMatchObject({
      kind: 'leg',
      mode: 'walk',
      minutes: 35,
      start: null,
      end: null,
    });
  });

  it('weighs the evening and the lunch break on the part '
     + 'with times only', () => {
    const plan = planDay(
      [tour('A', 60, markt), tour('B', 600, drachenfels)],
      { start: ten, bus: false, lunch: true },
    );

    // 10:00 to 11:00 is the whole timed day: too early for
    // lunch and nowhere near the evening.
    expect(plan.late).toBe(false);
    expect(plan.noLunchRoom).toBe(false);
  });

  it('turns the same day into times once the bus is on',
     () => {
    const plan = planDay(tours, {
      start: ten, bus: true, lunch: false,
    });

    expect(plan.tooFar).toBe(false);
    expect(plan.steps.every((step) => step.start !== null))
      .toBe(true);
  });
});

describe('planDay, by bus', () => {
  it('drives the long leg and walks the short one', () => {
    const plan = planDay(
      [tour('A', 60, markt), tour('B', 60, drachenfels),
       tour('C', 60, station)],
      { start: ten, bus: true, lunch: false },
    );

    expect(plan.steps[1]).toMatchObject({
      kind: 'leg',
      mode: 'bus',
      minutes: 45,
      start: 660,
      end: 705,
    });
    expect(plan.steps[3]).toMatchObject({
      kind: 'leg',
      mode: 'bus',
      start: 765,
    });
  });

  it('keeps a leg of under a kilometer on foot', () => {
    const plan = planDay(
      [tour('A', 60, markt), tour('B', 60, station)],
      { start: ten, bus: true, lunch: false },
    );

    expect(plan.steps[1]).toMatchObject({
      mode: 'walk',
      minutes: 10,
    });
  });
});

describe('planDay, lunch break', () => {
  it('breaks for an hour after the first tour that ends in '
     + 'the window, and moves the next leg', () => {
    const plan = planDay(
      [tour('A', 60, markt), tour('B', 60, { ...markt }),
       tour('C', 60, station)],
      { start: ten, bus: false, lunch: true },
    );

    expect(times(plan.steps)).toEqual([
      'tour 600-660',    // 10:00 to 11:00
      'tour 660-720',    // 11:00 to 12:00
      'lunch 720-780',   // 12:00 to 13:00
      'leg 780-790',     // the leg starts after lunch
      'tour 790-850',
    ]);
    expect(plan.steps[2]).toMatchObject({
      kind: 'lunch',
      minutes: 60,
      place: markt,
    });
    expect(plan.noLunchRoom).toBe(false);
  });

  it('breaks only once', () => {
    const plan = planDay(
      [tour('A', 120, markt), tour('B', 30, { ...markt }),
       tour('C', 30, { ...markt })],
      { start: ten, bus: false, lunch: true },
    );

    expect(kinds(plan.steps))
      .toEqual(['tour', 'lunch', 'tour', 'tour']);
  });

  it('takes a tour that ends at 11:30 and one that ends at '
     + '14:00', () => {
    const early = planDay(
      [tour('A', 90, markt), tour('B', 30, { ...markt })],
      { start: ten, bus: false, lunch: true },
    );
    const late = planDay(
      [tour('A', 240, markt), tour('B', 30, { ...markt })],
      { start: ten, bus: false, lunch: true },
    );

    expect(kinds(early.steps))
      .toEqual(['tour', 'lunch', 'tour']);
    expect(kinds(late.steps))
      .toEqual(['tour', 'lunch', 'tour']);
  });

  it('says there is no room when no tour ends in the window',
     () => {
    const plan = planDay(
      [tour('A', 80, markt), tour('B', 180, { ...markt })],
      { start: ten, bus: false, lunch: true },
    );

    // 10:00 to 11:20 and on to 14:20: the day runs right
    // through the window without ending inside it.
    expect(kinds(plan.steps)).toEqual(['tour', 'tour']);
    expect(plan.noLunchRoom).toBe(true);
  });

  it('keeps quiet about lunch for a day that ends before '
     + 'the window', () => {
    const plan = planDay(
      [tour('A', 30, markt), tour('B', 30, { ...markt })],
      { start: ten, bus: false, lunch: true },
    );

    expect(plan.noLunchRoom).toBe(false);
  });

  it('keeps quiet about lunch for a day that starts after '
     + 'the window', () => {
    const plan = planDay(
      [tour('A', 30, markt), tour('B', 30, { ...markt })],
      { start: 15 * 60, bus: false, lunch: true },
    );

    expect(plan.noLunchRoom).toBe(false);
  });

  it('leaves the day alone when the break is switched off',
     () => {
    const plan = planDay(
      [tour('A', 60, markt), tour('B', 60, { ...markt })],
      { start: ten, bus: false, lunch: false },
    );

    expect(kinds(plan.steps)).toEqual(['tour', 'tour']);
    expect(plan.noLunchRoom).toBe(false);
  });
});

describe('clockMinutes', () => {
  it('reads a time on its own', () => {
    expect(clockMinutes('10:00')).toBe(600);
    expect(clockMinutes('09:35')).toBe(575);
  });

  it('reads a time behind a date', () => {
    expect(clockMinutes('2026-09-16T14:30:00')).toBe(870);
  });

  it('has nothing to read in a date or in nonsense', () => {
    expect(clockMinutes('2026-09-16')).toBe(null);
    expect(clockMinutes('')).toBe(null);
    expect(clockMinutes('25:00')).toBe(null);
  });
});

describe('formatClock', () => {
  it('follows the language', () => {
    expect(formatClock(14 * 60 + 5, 'de')).toBe('14:05');
    expect(formatClock(14 * 60 + 5, 'en'))
      .toMatch(/^02:05\s?PM$/);
  });

  it('carries a long day over midnight', () => {
    expect(formatClock(25 * 60, 'de')).toBe('01:00');
  });
});

describe('formatDay', () => {
  it('writes the day out in the language', () => {
    expect(formatDay('2026-09-16', 'de'))
      .toBe('Mittwoch, 16. September 2026');
    expect(formatDay('2026-09-16T10:00:00', 'en'))
      .toBe('Wednesday, September 16, 2026');
  });
});

describe('oneLine', () => {
  it('pulls a text written over several lines together',
     () => {
    expect(oneLine('One leg is too far.\n      Turn on the '
                   + 'bus.\n'))
      .toBe('One leg is too far. Turn on the bus.');
  });

  it('leaves a single line alone', () => {
    expect(oneLine('10:00 – 11:00 — Round Trip Bonn'))
      .toBe('10:00 – 11:00 — Round Trip Bonn');
  });
});

describe('dayIso', () => {
  it('writes a date the way ion-datetime wants it', () => {
    expect(dayIso(new Date(2026, 8, 6))).toBe('2026-09-06');
  });
});
