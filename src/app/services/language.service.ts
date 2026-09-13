import { LOCALE_ID, Service, inject } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

export type LanguageChoice = 'en' | 'de';

@Service()
export class LanguageService {
  readonly current = inject(LOCALE_ID);

  async choose(value: LanguageChoice) {
    if (value === this.current) {
      return;
    }
    await Preferences.set({ key: 'language', value });
    // Translations are applied once, as the app starts.
    location.reload();
  }
}
