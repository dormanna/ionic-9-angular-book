import { Component, effect, inject, input,
         numberAttribute } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent,
         IonButtons, IonMenuButton, IonList, IonItem,
         IonLabel, IonNote, IonRouterLink, IonBadge,
         IonThumbnail, IonSpinner, IonText, IonRange }
        from '@ionic/angular';
import { TourService } from '../../services/tour.service';

const CHEAPEST = 80;
const DEAREST = 400;

@Component({
  selector: 'app-tours',
  templateUrl: './tours.page.html',
  imports: [RouterLink, IonRouterLink, IonHeader, IonToolbar,
            IonTitle, IonContent, IonButtons, IonMenuButton,
            IonList, IonItem, IonLabel, IonNote, IonBadge,
            IonThumbnail, IonSpinner, IonText, IonRange],
})
export class ToursPage {
  private readonly service = inject(TourService);
  private readonly router = inject(Router);

  readonly tours = this.service.all();
  readonly isLoading = this.service.isLoading;
  readonly error = this.service.error;

  readonly cheapest = CHEAPEST;
  readonly dearest = DEAREST;

  readonly maxPrice = input(DEAREST, {
    transform: (value: unknown) =>
      numberAttribute(value, DEAREST),
  });

  constructor() {
    effect(() => {
      const limit = this.maxPrice();
      this.service.narrowTo(
        limit < DEAREST ? { maxPrice: limit } : {},
      );
    });
  }

  setLimit(value: number | { lower: number; upper: number }) {
    if (typeof value !== 'number') {
      return;
    }
    this.router.navigate([], {
      queryParams: {
        maxPrice: value < DEAREST ? value : null,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
