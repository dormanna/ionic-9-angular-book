import { distanceInKm } from '../tours/distance';

// On foot up to three kilometers, at a walking pace.
const WALKING_KMH = 4;
const WALKING_LIMIT_KM = 3;

// The bus takes the roads, not the crow's line, and the
// ride costs ten minutes at the stops.
const BUS_KMH = 30;
const BUS_DETOUR = 1.4;
const BUS_BOARDING_MIN = 10;
const BUS_FROM_KM = 1;

// Every duration the plan shows is a multiple of this.
const STEP_MIN = 5;

const LUNCH_MIN = 60;
const LUNCH_OPENS = 11 * 60 + 30;
const LUNCH_CLOSES = 14 * 60;

const EVENING = 20 * 60;

export interface Place {
  lat: number;
  lng: number;
  location: string;
}

export interface PlannableTour {
  duration: number;
  startingPoint: Place;
}

export interface PlanOptions {
  // Minutes since midnight.
  start: number;
  bus: boolean;
  lunch: boolean;
}

export type LegMode = 'walk' | 'bus' | 'tooFar';

export interface TourStep<T> {
  kind: 'tour';
  tour: T;
  start: number | null;
  end: number | null;
}

export interface LegStep {
  kind: 'leg';
  mode: LegMode;
  km: number;
  // Nothing to say for a leg nobody can walk.
  minutes: number | null;
  start: number | null;
  end: number | null;
}

export interface LunchStep {
  kind: 'lunch';
  place: Place;
  minutes: number;
  start: number;
  end: number;
}

export type PlanStep<T> = TourStep<T> | LegStep | LunchStep;

export interface DayPlan<T> {
  steps: PlanStep<T>[];
  // A leg nobody can walk; from there on there are no times.
  tooFar: boolean;
  // A lunch break was wanted and no tour ends in the window.
  noLunchRoom: boolean;
  // The last tour with a time ends after 20:00.
  late: boolean;
  // When the last tour with a time ends.
  endsAt: number | null;
}

// Minutes always grow to the next five, and a hair over a
// whole step is still that step.
const roundUp = (minutes: number) =>
  Math.ceil(minutes / STEP_MIN - 1e-9) * STEP_MIN;

interface Leg {
  mode: LegMode;
  minutes: number | null;
}

// How the user gets from one starting point to the next.
export function legFor(km: number, bus: boolean): Leg {
  if (bus && km > BUS_FROM_KM) {
    return {
      mode: 'bus',
      minutes:
        roundUp((km * BUS_DETOUR) / BUS_KMH * 60)
        + BUS_BOARDING_MIN,
    };
  }
  if (km <= WALKING_LIMIT_KM) {
    return {
      mode: 'walk',
      minutes: roundUp((km / WALKING_KMH) * 60),
    };
  }
  return { mode: 'tooFar', minutes: null };
}

// The day in the order the tours are given: a leg between
// two starting points that differ, a lunch break after the
// first tour that ends in the lunch window, and no times
// from the first leg nobody can walk.
export function planDay<T extends PlannableTour>(
  tours: readonly T[],
  options: PlanOptions,
): DayPlan<T> {
  const steps: PlanStep<T>[] = [];
  let clock = options.start;
  let timed = true;
  let tooFar = false;
  let lunched = false;
  let endsAt: number | null = null;

  for (let index = 0; index < tours.length; index++) {
    const tour = tours[index];
    if (index > 0) {
      const km = distanceInKm(
        tours[index - 1].startingPoint,
        tour.startingPoint,
      );
      // Two tours that start in the same place: no leg.
      if (km > 0) {
        const leg = legFor(km, options.bus);
        if (leg.mode === 'tooFar') {
          tooFar = true;
          timed = false;
        }
        const minutes = leg.minutes;
        const walkable = timed && minutes !== null;
        steps.push({
          kind: 'leg',
          mode: leg.mode,
          km,
          minutes,
          start: walkable ? clock : null,
          end: walkable ? clock + minutes : null,
        });
        if (walkable) {
          clock += minutes;
        }
      }
    }

    if (!timed) {
      steps.push({ kind: 'tour', tour, start: null, end: null });
      continue;
    }

    const end = clock + tour.duration;
    steps.push({ kind: 'tour', tour, start: clock, end });
    clock = end;
    endsAt = end;

    if (options.lunch && !lunched
        && end >= LUNCH_OPENS && end <= LUNCH_CLOSES) {
      steps.push({
        kind: 'lunch',
        place: tour.startingPoint,
        minutes: LUNCH_MIN,
        start: end,
        end: end + LUNCH_MIN,
      });
      clock = end + LUNCH_MIN;
      lunched = true;
    }
  }

  // Only a day that reaches into the lunch window can be
  // missing its lunch break.
  const noLunchRoom =
    options.lunch && !lunched && endsAt !== null
    && options.start <= LUNCH_CLOSES && endsAt >= LUNCH_OPENS;

  return {
    steps,
    tooFar,
    noLunchRoom,
    late: endsAt !== null && endsAt > EVENING,
    endsAt,
  };
}

// "10:00", "2026-09-16T10:00:00": what ion-datetime hands
// back for a time, with or without a day in front of it.
export function clockMinutes(value: string): number | null {
  const parsed =
    /^(?:\d{4}-\d{2}-\d{2}T)?(\d{2}):(\d{2})/.exec(value);
  if (!parsed) {
    return null;
  }
  const hours = Number(parsed[1]);
  const minutes = Number(parsed[2]);
  if (hours > 23 || minutes > 59) {
    return null;
  }
  return hours * 60 + minutes;
}

// A clock time in the app's language: "14:30" or "2:30 PM".
export function formatClock(minutes: number,
                            locale: string): string {
  const day = new Date(2000, 0, 1, 0, minutes);
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(day);
}

// A day in the app's language, from a "YYYY-MM-DD" value.
export function formatDay(value: string,
                          locale: string): string {
  const [year, month, day] = value.slice(0, 10).split('-');
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'full',
  }).format(new Date(Number(year), Number(month) - 1,
                     Number(day)));
}

// A translated text can be written over several lines. On
// one line, as a shared plan needs it, the breaks and the
// indentation turn back into single spaces.
export function oneLine(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

// Today, as ion-datetime wants it.
export function dayIso(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
