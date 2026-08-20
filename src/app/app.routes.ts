import { Routes } from '@angular/router';

const placeholder = () =>
  import('./pages/placeholder/placeholder.page')
    .then((m) => m.PlaceholderPage);

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home',  data: { title: 'Home' },
    loadComponent: placeholder },
  { path: 'tours', data: { title: 'Tours' },
    loadComponent: placeholder },
  { path: 'about', data: { title: 'About' },
    loadComponent: placeholder },
];
