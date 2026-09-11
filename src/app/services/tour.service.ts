import { Service, computed, linkedSignal, signal }
        from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Tour } from '../models/tour';
import { apiUrl } from './api';

interface LookupPayload {
  ID: string;
  Name: string;
}

const toLookup = (l: LookupPayload) => ({
  id: l.ID,
  name: l.Name,
});

interface TourPayload {
  ID: number;
  Title: string;
  Description: string;
  Image: string;
  Duration: number;
  MaxPersons: number;
  PriceG: number;
  PriceF: number;
  StartingPoint: {
    Lat: string;
    Lng: string;
    Location: string;
  };
}

const toTour = (t: TourPayload): Tour => ({
  id: String(t.ID),
  title: t.Title,
  summary: t.Description,
  imageUrl: apiUrl(`/api/img/big/${t.Image}`),
  thumbnailUrl: apiUrl(`/api/img/small/${t.Image}`),
  duration: t.Duration,
  maxPersons: t.MaxPersons,
  price: t.PriceG,
  priceForeign: t.PriceF,
  startingPoint: {
    lat: Number(t.StartingPoint.Lat),
    lng: Number(t.StartingPoint.Lng),
    location: t.StartingPoint.Location,
  },
});

export interface Criteria {
  maxPrice?: number;
  q?: string;
  region?: string;
  tourType?: string;
}

@Service()
export class TourService {
  private readonly criteria = signal<Criteria>({});

  private urlFor(criteria: Criteria) {
    const params = new URLSearchParams();
    if (criteria.maxPrice !== undefined) {
      params.set('maxPrice', String(criteria.maxPrice));
    }
    if (criteria.q) {
      params.set('q', criteria.q);
    }
    if (criteria.region) {
      params.set('region', criteria.region);
    }
    if (criteria.tourType) {
      params.set('tourType', criteria.tourType);
    }
    const query = params.toString();
    return apiUrl(
      query ? `/api/tours?${query}` : '/api/tours',
    );
  }

  narrowTo(criteria: Criteria) {
    this.criteria.set(criteria);
  }

  private readonly resource = httpResource<TourPayload[]>(
    () => this.urlFor(this.criteria()),
    { defaultValue: [] },
  );

  private readonly regionResource =
    httpResource<LookupPayload[]>(
      () => apiUrl('/api/regions'),
      { defaultValue: [] },
    );

  private readonly typeResource =
    httpResource<LookupPayload[]>(
      () => apiUrl('/api/tourtypes'),
      { defaultValue: [] },
    );

  readonly regions = computed(() =>
    this.regionResource.hasValue()
      ? this.regionResource.value().map(toLookup)
      : [],
  );

  readonly tourTypes = computed(() =>
    this.typeResource.hasValue()
      ? this.typeResource.value().map(toLookup)
      : [],
  );

  private readonly tours = linkedSignal<Tour[], Tour[]>({
    source: () =>
      this.resource.hasValue()
        ? this.resource.value().map(toTour)
        : [],
    computation: (tours, previous) =>
      this.resource.isLoading() && previous
        ? previous.value
        : tours,
  });

  all() {
    return this.tours;
  }

  byId(id: string): Tour | undefined {
    return this.tours().find((t) => t.id === id);
  }

  reload() {
    this.resource.reload();
  }

  readonly isLoading = this.resource.isLoading;
  readonly firstLoad = computed(
    () => this.resource.status() === 'loading',
  );
  readonly error = this.resource.error;
}
