import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Draft, TourRequest } from '../models/request';
import { apiUrl } from './api';

export interface SavedRequest extends TourRequest {
  ID: number;
}

@Service()
export class RequestService {
  private readonly http = inject(HttpClient);

  send(request: TourRequest) {
    return firstValueFrom(
      this.http.post<SavedRequest>(
        apiUrl('/api/requests'),
        request,
      ),
    );
  }

  // today as YYYY-MM-DD, from this device's calendar.
  draft(sentence: string, today: string) {
    return firstValueFrom(
      this.http.post<Draft>(
        apiUrl('/api/drafts'),
        { sentence, today },
      ),
    );
  }
}
