import { Service, inject, linkedSignal } from '@angular/core';
import { HttpClient, httpResource }
        from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface TourRequest {
  ID?: number;
  tourId: string;
  name: string;
  people: number;
}

@Service()
export class RequestService {
  private readonly http = inject(HttpClient);

  private readonly resource = httpResource<TourRequest[]>(
    () => '/api/requests',
    { defaultValue: [] },
  );

  readonly all = linkedSignal(() =>
    this.resource.hasValue()
      ? this.resource.value()
      : [],
  );

  async send(request: TourRequest): Promise<TourRequest> {
    const stored = await firstValueFrom(
      this.http.post<TourRequest>('/api/requests', request),
    );
    this.all.update((sent) => [...sent, stored]);
    return stored;
  }
}
