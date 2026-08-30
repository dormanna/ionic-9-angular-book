import { Service, computed, linkedSignal, signal }
        from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Tour } from '../models/tour';

interface TourPayload {
  ID: number;
  Title: string;
  Description: string;
  Image: string;
  Duration: number;
  MaxPersons: number;
  PriceG: number;
}

const toTour = (t: TourPayload): Tour => ({
  id: String(t.ID),
  title: t.Title,
  summary: t.Description,
  imageUrl: `/api/img/big/${t.Image}`,
  thumbnailUrl: `/api/img/small/${t.Image}`,
  duration: t.Duration,
  maxPersons: t.MaxPersons,
  price: t.PriceG,
});

export interface Criteria {
  maxPrice?: number;
  q?: string;
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
    const query = params.toString();
    return query ? `/api/tours?${query}` : '/api/tours';
  }

  narrowTo(criteria: Criteria) {
    this.criteria.set(criteria);
  }

  private readonly resource = httpResource<TourPayload[]>(
    () => this.urlFor(this.criteria()),
    { defaultValue: [] },
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
