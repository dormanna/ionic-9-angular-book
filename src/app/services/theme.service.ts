import { Service, effect, signal } from '@angular/core';

export type ThemeChoice = 'system' | 'light' | 'dark';

@Service()
export class ThemeService {
  readonly choice = signal<ThemeChoice>('system');

  private readonly query =
    window.matchMedia('(prefers-color-scheme: dark)');
  private readonly systemDark = signal(this.query.matches);

  constructor() {
    this.query.addEventListener('change', (event) =>
      this.systemDark.set(event.matches));

    effect(() => {
      const dark =
        this.choice() === 'dark' ||
        (this.choice() === 'system' && this.systemDark());
      document.documentElement.classList
        .toggle('ion-palette-dark', dark);
    });
  }
}
