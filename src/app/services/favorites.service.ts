import { Service, signal } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Service()
export class FavoritesService {
  private readonly ids = signal<string[]>([]);

  readonly all = this.ids.asReadonly();

  async restore() {
    const { value } =
      await Preferences.get({ key: 'favorites' });
    if (value) {
      this.ids.set(JSON.parse(value));
    }
  }

  async toggle(id: string) {
    this.ids.update((ids) =>
      ids.includes(id)
        ? ids.filter((other) => other !== id)
        : [...ids, id],
    );
    await Preferences.set({
      key: 'favorites',
      value: JSON.stringify(this.ids()),
    });
  }
}
