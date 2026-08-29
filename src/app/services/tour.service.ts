import { Service, computed, signal } from '@angular/core';
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
}

@Service()
export class TourService {
  private readonly criteria = signal<Criteria>({});

  private urlFor(criteria: Criteria) {
    const params = new URLSearchParams();
    if (criteria.maxPrice !== undefined) {
      params.set('maxPrice', String(criteria.maxPrice));
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

  private readonly tours = computed(() =>
    this.resource.hasValue()
      ? this.resource.value().map(toTour)
      : [],
  );

  all() {
    return this.tours;
  }

  byId(id: string): Tour | undefined {
    return this.tours().find((t) => t.id === id);
  }

  readonly isLoading = this.resource.isLoading;
  readonly error = this.resource.error;
}
