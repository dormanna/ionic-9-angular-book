import { Component, computed, effect, inject, input,
         numberAttribute, signal } from '@angular/core';
import { Params, Router, RouterLink }
        from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent,
         IonButtons, IonMenuButton, IonList, IonItem,
         IonLabel, IonNote, IonRouterLink, IonBadge,
         IonThumbnail, IonSpinner, IonText, IonRange,
         IonRefresher, IonRefresherContent, IonButton,
         IonSearchbar, IonSegment, IonSegmentButton,
         IonSelect, IonSelectOption,
         RefresherCustomEvent }
        from '@ionic/angular';
import { TourService } from '../../services/tour.service';
import { FavoritesService }
        from '../../services/favorites.service';

const CHEAPEST = 80;
const DEAREST = 400;

@Component({
  selector: 'app-tours',
  templateUrl: './tours.page.html',
  imports: [RouterLink, IonRouterLink, IonHeader, IonToolbar,
            IonTitle, IonContent, IonButtons, IonMenuButton,
            IonList, IonItem, IonLabel, IonNote, IonBadge,
            IonThumbnail, IonSpinner, IonText, IonRange,
            IonRefresher, IonRefresherContent, IonButton,
            IonSearchbar, IonSegment, IonSegmentButton,
            IonSelect, IonSelectOption],
})
export class ToursPage {
  private readonly service = inject(TourService);
  private readonly favorites = inject(FavoritesService);
  private readonly router = inject(Router);

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
