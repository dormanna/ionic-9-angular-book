import { Service, computed, linkedSignal, signal }
        from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Tour } from '../models/tour';

export interface Criteria {
  q: string;
  region: string;
}

interface TourPayload {
  ID: number;
  Title: string;
  Description: string;
  Duration: number;
  PriceG: number;
  Region: string;
  Tourtype: string;
}

const toTour = (t: TourPayload): Tour => ({
  id: String(t.ID),
  title: t.Title,
  summary: t.Description,
  duration: t.Duration,
  price: t.PriceG,
  region: t.Region,
  tourtype: t.Tourtype,
});

const urlFor = ({ q, region }: Criteria): string => {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (region) params.set('region', region);
  const query = params.toString();
  return query ? `/api/tours?${query}` : '/api/tours';
};

@Service()
export class TourService {
  private readonly criteria = signal<Criteria>({
    q: '',
    region: '',
  });

  private readonly resource = httpResource<TourPayload[]>(
    () => urlFor(this.criteria()),
    { defaultValue: [] },
  );

  private readonly arrived = computed(() =>
    this.resource.hasValue()
      ? this.resource.value().map(toTour)
      : [],
  );

  private readonly tours = linkedSignal<Tour[], Tour[]>({
    source: () => this.arrived(),
    computation: (fresh, previous) =>
      this.resource.isLoading() && previous
        ? previous.value
        : fresh,
  });

  all() {
    return this.tours.asReadonly();
  }

  byId(id: string): Tour | undefined {
    return this.tours().find((t) => t.id === id);
  }

  narrowTo(criteria: Criteria): void {
    this.criteria.set(criteria);
  }

  readonly isLoading = this.resource.isLoading;
  readonly error = this.resource.error;
}
