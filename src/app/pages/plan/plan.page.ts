import { Component, LOCALE_ID, computed, inject, signal }
        from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent,
         IonButtons, IonBackButton, IonButton, IonIcon,
         IonList, IonItem, IonLabel, IonNote,
         IonText, IonSpinner, IonToggle, IonDatetime,
         IonDatetimeButton, IonModal, IonReorder,
         IonReorderGroup, ReorderEndCustomEvent }
        from '@ionic/angular';
import { Share } from '@capacitor/share';
import { addIcons } from 'ionicons';
import { walkOutline, busOutline, restaurantOutline,
         alertCircleOutline, locationOutline, arrowUpOutline,
         arrowDownOutline, shareSocialOutline }
        from 'ionicons/icons';
import { TourService } from '../../services/tour.service';
import { FavoritesService }
        from '../../services/favorites.service';
import { openMapSearch } from '../../services/maps';
import { formatDistance } from '../tours/distance';
import { Tour } from '../../models/tour';
import { Place, PlanStep, clockMinutes, dayIso, formatClock,
         formatDay, oneLine, planDay } from './plan';

const DEFAULT_START = '10:00';

export interface PlanRow {
  kind: 'tour' | 'leg' | 'lunch';
  icon: string;
  text: string;
  // How long the step takes and, for a leg, how far it is.
  note: string;
  time: string;
  // Only a lunch break has one: where to look for food.
  place: Place | null;
}

@Component({
  selector: 'app-plan',
  templateUrl: './plan.page.html',
  styleUrl: './plan.page.scss',
  imports: [IonHeader, IonToolbar, IonTitle, IonContent,
            IonButtons, IonBackButton, IonButton, IonIcon,
            IonList, IonItem, IonLabel,
            IonNote, IonText, IonSpinner, IonToggle,
            IonDatetime, IonDatetimeButton, IonModal,
            IonReorder, IonReorderGroup],
})
export class PlanPage {
  private readonly service = inject(TourService);
  private readonly favorites = inject(FavoritesService);
  // ion-datetime needs it in the template as well.
  readonly locale = inject(LOCALE_ID);

  // ion-datetime follows the device, not the app.
  readonly firstDayOfWeek = this.locale === 'de' ? 1 : 0;

  readonly today = dayIso(new Date());
  readonly date = signal(this.today);
  readonly startTime = signal(DEFAULT_START);
  readonly bus = signal(false);
  readonly lunch = signal(true);

  // The order the user dragged the tours into, kept for as
  // long as the page is open. What is stored stays the
  // favorites and nothing else.
  private readonly ordered = signal<string[] | null>(null);

  readonly loading = this.service.firstLoad;

  readonly tours = computed(() => {
    const favorites = this.favorites.all();
    const ordered = this.ordered();
    // Without a hand-made order, the order they became
    // favorites in. A favorite that went away drops out of
    // a hand-made one, a new one joins at the end.
    const ids = ordered
      ? [...ordered.filter((id) => favorites.includes(id)),
         ...favorites.filter((id) => !ordered.includes(id))]
      : favorites;
    return ids
      .map((id) => this.service.byId(id))
      .filter((tour): tour is Tour => tour !== undefined);
  });

  readonly plan = computed(() =>
    planDay(this.tours(), {
      start: clockMinutes(this.startTime()) ?? 0,
      bus: this.bus(),
      lunch: this.lunch(),
    }),
  );

  readonly rows = computed(() =>
    this.plan().steps.map((step) => this.rowFor(step)),
  );

  readonly dayText = computed(() =>
    formatDay(this.date(), this.locale));

  readonly lateText = computed(() => {
    const endsAt = this.plan().endsAt;
    const time = endsAt === null
      ? '' : formatClock(endsAt, this.locale);
    return $localize
      `:@@plan.late:The last tour ends at ${time}:time:, after 20:00.`;
  });

  readonly tooFarText =
    $localize`:@@plan.tooFarNote:One leg is too far to walk.
      Turn on the bus transfer or change the order of the
      tours.`;

  readonly noLunchText =
    $localize`:@@plan.noLunchNote:No tour ends between 11:30
      and 14:00, so there is no room for a lunch break.`;

  readonly canShare = signal(false);

  constructor() {
    addIcons({ walkOutline, busOutline, restaurantOutline,
               alertCircleOutline, locationOutline,
               arrowUpOutline, arrowDownOutline,
               shareSocialOutline });
    Share.canShare()
      .then(({ value }) => this.canShare.set(value));
  }

  setDate(value: string | string[] | null | undefined) {
    if (typeof value === 'string') {
      this.date.set(value.slice(0, 10));
    }
  }

  setStart(value: string | string[] | null | undefined) {
    if (typeof value === 'string'
        && clockMinutes(value) !== null) {
      this.startTime.set(value);
    }
  }

  reorder(event: ReorderEndCustomEvent) {
    const { from, to } = event.detail;
    // The list is drawn from the order below, so the
    // dragged item is not moved in the DOM as well.
    event.detail.complete(false);
    this.move(from, to);
  }

  move(from: number, to: number) {
    const ids = this.tours().map((tour) => tour.id);
    if (from === to || to < 0 || to >= ids.length) {
      return;
    }
    const [moved] = ids.splice(from, 1);
    ids.splice(to, 0, moved);
    this.ordered.set(ids);
  }

  moveLabel(title: string, up: boolean) {
    return up
      ? $localize`:@@plan.moveUp:Move ${title}:title: up`
      : $localize`:@@plan.moveDown:Move ${title}:title: down`;
  }

  eatHere(place: Place) {
    openMapSearch(
      place,
      $localize`:@@plan.restaurants:Restaurants`,
    );
  }

  async share() {
    try {
      await Share.share({
        title: $localize`:@@plan.title:Plan My Day`,
        text: this.planText(),
        dialogTitle: $localize`:@@plan.share:Share this plan`,
      });
    } catch {
      // Canceling and failing to share are both silent here.
    }
  }

  // The plan as text: the day, every step in order and
  // whatever the page warns about.
  planText(): string {
    const plan = this.plan();
    const date = this.dayText();
    const time = formatClock(
      clockMinutes(this.startTime()) ?? 0, this.locale);
    const lines = [
      $localize`:@@plan.title:Plan My Day`,
      $localize`:@@plan.dayLine:${date}:date:, from ${time}:time:`,
    ];
    for (const row of this.rows()) {
      const step = row.note
        ? `${row.text} (${row.note})` : row.text;
      lines.push(row.time ? `${row.time} — ${step}` : step);
    }
    if (plan.tooFar) {
      lines.push(this.tooFarText);
    }
    if (plan.noLunchRoom) {
      lines.push(this.noLunchText);
    }
    if (plan.late) {
      lines.push(this.lateText());
    }
    return lines.map(oneLine).join('\n');
  }

  private rowFor(step: PlanStep<Tour>): PlanRow {
    const time = this.range(step.start, step.end);
    if (step.kind === 'tour') {
      return {
        kind: 'tour',
        icon: 'location-outline',
        text: step.tour.title,
        note: `${step.tour.duration} min`,
        time,
        place: null,
      };
    }
    if (step.kind === 'lunch') {
      return {
        kind: 'lunch',
        icon: 'restaurant-outline',
        text: $localize`:@@plan.lunch:Lunch break`,
        note: `${step.minutes} min`,
        time,
        place: step.place,
      };
    }
    const distance = formatDistance(step.km, this.locale);
    if (step.mode === 'tooFar') {
      return {
        kind: 'leg',
        icon: 'alert-circle-outline',
        text: $localize`:@@plan.tooFar:Too far to walk`,
        note: distance,
        time,
        place: null,
      };
    }
    const bus = step.mode === 'bus';
    return {
      kind: 'leg',
      icon: bus ? 'bus-outline' : 'walk-outline',
      text: bus
        ? $localize`:@@plan.byBus:By bus`
        : $localize`:@@plan.onFoot:On foot`,
      note: `${step.minutes} min · ${distance}`,
      time,
      place: null,
    };
  }

  private range(start: number | null, end: number | null) {
    if (start === null || end === null) {
      return '';
    }
    const from = formatClock(start, this.locale);
    const to = formatClock(end, this.locale);
    return $localize`:@@plan.range:${from}:from: – ${to}:to:`;
  }
}
