import { Component, LOCALE_ID, computed, effect, inject,
         input, numberAttribute, signal } from '@angular/core';
import { Params, Router, RouterLink }
        from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent,
         IonButtons, IonMenuButton, IonList, IonItem,
         IonLabel, IonNote, IonRouterLink, IonBadge,
         IonThumbnail, IonSpinner, IonText, IonRange,
         IonRefresher, IonRefresherContent, IonButton,
         IonSearchbar, IonSegment, IonSegmentButton,
         IonSelect, IonSelectOption, IonIcon,
         RefresherCustomEvent }
        from '@ionic/angular';
import { addIcons } from 'ionicons';
import { calendarOutline, refreshOutline }
        from 'ionicons/icons';
import { TourService } from '../../services/tour.service';
import { FavoritesService }
        from '../../services/favorites.service';
import { LocationService, Unlocated }
        from '../../services/location.service';
import { Coordinates, formatDistance, nearestFirst }
        from './distance';

const CHEAPEST = 80;
const DEAREST = 400;

export type SortOrder = 'catalog' | 'distance';

@Component({
  selector: 'app-tours',
  templateUrl: './tours.page.html',
  styleUrl: './tours.page.scss',
  imports: [RouterLink, IonRouterLink, IonHeader, IonToolbar,
            IonTitle, IonContent, IonButtons, IonMenuButton,
            IonList, IonItem, IonLabel, IonNote, IonBadge,
            IonThumbnail, IonSpinner, IonText, IonRange,
            IonRefresher, IonRefresherContent, IonButton,
            IonSearchbar, IonSegment, IonSegmentButton,
            IonSelect, IonSelectOption, IonIcon],
})
export class ToursPage {
  private readonly service = inject(TourService);
  private readonly favorites = inject(FavoritesService);
  private readonly router = inject(Router);
  private readonly location = inject(LocationService);
  private readonly locale = inject(LOCALE_ID);

  readonly tours = this.service.all();
  readonly view = signal<'all' | 'favorites'>('all');

  readonly shown = computed(() => {
    const tours = this.tours();
    if (this.view() === 'all') {
      return tours;
    }
    const ids = this.favorites.all();
    return tours.filter((tour) => ids.includes(tour.id));
  });

  // Not in the URL: a shared link must not open with a
  // request for the user's location.
  readonly sort = signal<SortOrder>('catalog');
  readonly here = signal<Coordinates | null>(null);
  readonly locating = signal(false);
  readonly unlocated = signal<Unlocated | null>(null);
  private lookups = 0;

  readonly rows = computed(() => {
    const tours = this.shown();
    const here = this.here();
    if (this.sort() !== 'distance' || !here) {
      return tours.map((tour) => ({ tour, distance: '' }));
    }
    return nearestFirst(tours, here).map(({ tour, km }) => ({
      tour,
      distance: Number.isFinite(km)
        ? formatDistance(km, this.locale)
        : '',
    }));
  });

  // A day can only be planned from two tours on, and only
  // the favorites make one.
  readonly canPlan = computed(
    () => this.view() === 'favorites'
      && this.favorites.all().length >= 2,
  );

  readonly countLabel = computed(() => {
    const count = this.shown().length;
    return $localize`:@@tours.count:${count}:count: tours`;
  });

  readonly firstLoad = this.service.firstLoad;
  readonly error = this.service.error;

  readonly cheapest = CHEAPEST;
  readonly dearest = DEAREST;

  readonly maxPrice = input(DEAREST, {
    transform: (value: unknown) =>
      numberAttribute(value, DEAREST),
  });

  readonly q = input('');
  readonly region = input('');
  readonly tourType = input('');

  readonly regions = this.service.regions;
  readonly tourTypes = this.service.tourTypes;

  readonly filtered = computed(
    () =>
      Boolean(this.q() || this.region() || this.tourType()) ||
      this.maxPrice() < DEAREST,
  );

  private finishPull: (() => void) | null = null;

  constructor() {
    addIcons({ refreshOutline, calendarOutline });
    effect(() => {
      if (!this.service.isLoading() && this.finishPull) {
        this.finishPull();
        this.finishPull = null;
      }
    });

    effect(() => {
      const limit = this.maxPrice();
      this.service.narrowTo({
        maxPrice: limit < DEAREST ? limit : undefined,
        q: this.q() || undefined,
        region: this.region() || undefined,
        tourType: this.tourType() || undefined,
      });
    });
  }

  refresh(event: RefresherCustomEvent) {
    this.finishPull = () => event.detail.complete();
    this.service.reload();
    if (this.sort() === 'distance') {
      this.locate();
    }
  }

  setSort(value: string | undefined) {
    const sort = value === 'distance' ? 'distance' : 'catalog';
    this.sort.set(sort);
    this.unlocated.set(null);
    if (sort === 'distance') {
      return this.locate();
    }
    // Whatever a lookup still in flight finds is not wanted.
    this.lookups++;
    this.locating.set(false);
    return Promise.resolve();
  }

  private async locate() {
    const lookup = ++this.lookups;
    this.locating.set(true);
    const result = await this.location.locate();
    // Only the latest lookup has a say.
    if (lookup !== this.lookups) {
      return;
    }
    this.locating.set(false);
    if (this.sort() !== 'distance') {
      return;
    }
    if (result.found) {
      this.here.set(result.here);
    } else {
      // Back to an order the list can keep, and say why.
      this.sort.set('catalog');
      this.unlocated.set(result.reason);
    }
  }

  setView(value: string | number | undefined) {
    const view =
      value === 'favorites' ? 'favorites' : 'all';
    this.view.set(view);
    if (view === 'favorites') {
      this.clearFilters();
    }
  }

  setRegion(value: string) {
    this.narrow({ region: value || null });
  }

  setTourType(value: string) {
    this.narrow({ tourType: value || null });
  }

  setQuery(value: string | null | undefined) {
    this.narrow({ q: value || null });
  }

  private narrow(queryParams: Params) {
    this.router.navigate([], {
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  clearFilters() {
    this.narrow({
      q: null,
      region: null,
      tourType: null,
      maxPrice: null,
    });
  }

  retry() {
    this.service.reload();
  }

  setLimit(value: number | { lower: number; upper: number }) {
    if (typeof value !== 'number') {
      return;
    }
    this.narrow({
      maxPrice: value < DEAREST ? value : null,
    });
  }
}
