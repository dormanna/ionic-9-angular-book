import { Service, effect, signal } from '@angular/core';

export type ThemeChoice = 'system' | 'light' | 'dark';

@Service()
export class ThemeService {
  readonly choice = signal<ThemeChoice>('system');

  private readonly query =
    window.matchMedia('(prefers-color-scheme: dark)');
  private readonly systemDark = signal(this.query.matches);

  private readonly contrastQuery =
    window.matchMedia('(prefers-contrast: more)');
  private readonly moreContrast =
    signal(this.contrastQuery.matches);

  constructor() {
    this.query.addEventListener('change', (event) =>
      this.systemDark.set(event.matches));

    this.contrastQuery.addEventListener('change', (event) =>
      this.moreContrast.set(event.matches));

    effect(() => {
      document.documentElement.classList.toggle(
        'ion-palette-high-contrast', this.moreContrast());
    });

    effect(() => {
      const dark =
        this.choice() === 'dark' ||
        (this.choice() === 'system' && this.systemDark());
      document.documentElement.classList
        .toggle('ion-palette-dark', dark);
    });
  }
}
