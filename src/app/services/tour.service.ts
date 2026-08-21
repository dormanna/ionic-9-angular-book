import { Service, computed } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Tour } from '../models/tour';

interface TourPayload {
  ID: number;
  Title: string;
  Description: string;
  Duration: number;
  PriceG: number;
}

const toTour = (t: TourPayload): Tour => ({
  id: String(t.ID),
  title: t.Title,
  summary: t.Description,
  duration: t.Duration,
  price: t.PriceG,
});

@Service()
export class TourService {
  private readonly resource = httpResource<TourPayload[]>(
    () => '/api/tours',
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
