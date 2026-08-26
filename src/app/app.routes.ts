import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home',
    loadComponent: () =>
      import('./pages/home/home.page').then((m) => m.HomePage) },
  { path: 'tours',
    loadComponent: () =>
      import('./pages/tours/tours.page')
        .then((m) => m.ToursPage) },
  { path: 'tours/:id',
    loadComponent: () =>
      import('./pages/tour/tour.page').then((m) => m.TourPage) },
  { path: 'tours/:id/request',
    loadComponent: () =>
      import('./pages/request/request.page')
        .then((m) => m.RequestPage) },
  { path: 'demo',
    loadComponent: () =>
      import('./pages/demo/demo.page').then((m) => m.DemoPage) },
  { path: 'about',
    loadComponent: () =>
      import('./pages/about/about.page')
        .then((m) => m.AboutPage) },
  { path: '**', redirectTo: 'home' },
];
