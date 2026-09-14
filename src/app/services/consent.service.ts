import { Service, signal } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

// Whether a sentence may go to the AI provider. Switched on
// in the form assistant, and off again there.
@Service()
export class ConsentService {
  private readonly state = signal(false);

  readonly given = this.state.asReadonly();

  async restore() {
    const { value } =
      await Preferences.get({ key: 'aiConsent' });
    this.state.set(value === 'yes');
  }

  async give() {
    this.state.set(true);
    await Preferences.set({ key: 'aiConsent', value: 'yes' });
  }

  async withdraw() {
    this.state.set(false);
    await Preferences.remove({ key: 'aiConsent' });
  }
}
