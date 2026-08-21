import { Service, signal } from '@angular/core';
import { Tour } from '../models/tour';

@Service()
export class TourService {
  private readonly tours = signal<Tour[]>([
    { id: '1', title: 'Round Trip Bonn',
      summary: 'The main sights, in one loop.',
      duration: 60, price: 90 },
    { id: '5', title: 'In the Footsteps of Beethoven',
      summary: 'Where the composer grew up.',
      duration: 60, price: 80 },
    { id: '8', title: 'Churches in and around Bonn',
      summary: 'Minster, chapels and a crypt.',
      duration: 120, price: 170 },
    { id: '11', title: 'The Seven Mountains',
      summary: 'Seven hills above the Rhine.',
      duration: 180, price: 160 },
  ]);

  all() {
    return this.tours;
  }

  byId(id: string): Tour | undefined {
    return this.tours().find((t) => t.id === id);
  }
}
