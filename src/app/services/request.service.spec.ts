import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { RequestService } from './request.service';
import { TourRequest } from '../models/request';

const request: TourRequest = {
  date: '2026-09-20T09:00:00',
  people: 2,
  firstName: 'Anna',
  lastName: 'Meyer',
  email: 'anna@example.com',
  message: '',
  language: 'en',
  bus: false,
  pickUp: '',
};

describe('RequestService', () => {
  let service: RequestService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()],
    });
    service = TestBed.inject(RequestService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('posts the request to /api/requests', async () => {
    const sent = service.send(request);

    const call = http.expectOne('/api/requests');
    expect(call.request.method).toBe('POST');
    expect(call.request.body).toEqual(request);

    call.flush({ ...request, ID: 42 });
    await sent;
  });

  it('hands back what the server answered', async () => {
    const sent = service.send(request);

    http.expectOne('/api/requests')
      .flush({ ...request, ID: 42 });

    expect(await sent).toEqual({ ...request, ID: 42 });
  });

  it('passes a failure on instead of swallowing it',
     async () => {
    const sent = service.send(request);

    http.expectOne('/api/requests').flush('no', {
      status: 500,
      statusText: 'Server Error',
    });

    await expect(sent).rejects
      .toMatchObject({ status: 500 });
  });
});
