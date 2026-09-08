import { Service, computed, effect, inject, signal }
        from '@angular/core';
import { Platform } from '@ionic/angular';
import { SystemBars, SystemBarsStyle, SystemBarType }
        from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

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

  private readonly dark = computed(() =>
    this.choice() === 'dark' ||
    (this.choice() === 'system' && this.systemDark()));

  private readonly ios = inject(Platform).is('ios');

  async restore() {
    const { value } =
      await Preferences.get({ key: 'appearance' });
    if (value === 'light' || value === 'dark'
        || value === 'system') {
      this.choice.set(value);
    }
  }

  async choose(value: ThemeChoice) {
    this.choice.set(value);
    await Preferences.set({ key: 'appearance', value });
  }

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
      document.documentElement.classList
        .toggle('ion-palette-dark', this.dark());
    });

    effect(() => {
      // The icons follow the toolbar: marine wants light ones,
      // the sky toolbar of iOS's dark palette wants dark ones.
      const lightToolbar = this.dark() && this.ios;
      SystemBars.setStyle({
        style: lightToolbar
          ? SystemBarsStyle.Light
          : SystemBarsStyle.Dark,
        bar: SystemBarType.StatusBar,
      });
    });
  }
}
