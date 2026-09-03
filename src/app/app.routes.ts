import { Routes } from '@angular/router';
import { unsavedChanges }
        from './pages/request/unsaved-changes.guard';

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
        .then((m) => m.RequestPage),
    canDeactivate: [unsavedChanges] },
  { path: 'about',
    loadComponent: () =>
      import('./pages/about/about.page')
        .then((m) => m.AboutPage) },
  { path: '**', redirectTo: 'home' },
];
