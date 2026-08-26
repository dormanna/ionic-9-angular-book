import { Service, signal } from '@angular/core';

@Service()
export class FavoritesService {
  private readonly ids = signal<string[]>([]);

  readonly all = this.ids.asReadonly();

  toggle(id: string) {
    this.ids.update((ids) =>
      ids.includes(id)
        ? ids.filter((other) => other !== id)
        : [...ids, id],
    );
  }
}
