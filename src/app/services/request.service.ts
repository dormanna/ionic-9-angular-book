import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TourRequest } from '../models/request';
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
}
