import { Component, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink }
        from '@angular/router';
import { debounceTime, map } from 'rxjs';
import { IonHeader, IonToolbar, IonTitle, IonContent,
         IonButtons, IonMenuButton, IonList, IonItem,
         IonLabel, IonNote, IonRouterLink, IonSearchbar,
         IonSelect, IonSelectOption, IonSpinner, IonText }
        from '@ionic/angular';
import { TourService } from '../../services/tour.service';

@Component({
  selector: 'app-tours',
  templateUrl: './tours.page.html',
  imports: [RouterLink, IonRouterLink, IonHeader, IonToolbar,
            IonTitle, IonContent, IonButtons, IonMenuButton,
            IonList, IonItem, IonLabel, IonNote, IonSearchbar,
            IonSelect, IonSelectOption, IonSpinner, IonText],
})
export class ToursPage {
  private readonly service = inject(TourService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly q = input('');
  readonly region = input('');

  readonly tours = this.service.all();
  readonly isLoading = this.service.isLoading;
  readonly error = this.service.error;

  constructor() {
    this.route.queryParams
      .pipe(
        map((p) => ({
          q: p['q'] ?? '',
          region: p['region'] ?? '',
        })),
        debounceTime(300),
        takeUntilDestroyed(),
      )
      .subscribe((criteria) => this.service.narrowTo(criteria));
  }

  narrow(key: 'q' | 'region', value: string): void {
    this.router.navigate([], {
      queryParams: { [key]: value || null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
