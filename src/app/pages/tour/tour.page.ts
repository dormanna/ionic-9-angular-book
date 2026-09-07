import { Component, ElementRef, computed, inject, input,
         viewChild }
        from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent,
         IonButtons, IonBackButton, IonButton, IonIcon,
         IonCard, IonCardHeader, IonCardTitle,
         IonCardContent, IonChip, IonFab, IonFabButton,
         IonGrid, IonRow, IonCol, IonRouterLink,
         AnimationController }
        from '@ionic/angular';
import { addIcons } from 'ionicons';
import { heart, heartOutline, timeOutline, peopleOutline,
         cashOutline, paperPlaneOutline }
        from 'ionicons/icons';
import { TourService } from '../../services/tour.service';
import { FavoritesService }
        from '../../services/favorites.service';

@Component({
  selector: 'app-tour',
  templateUrl: './tour.page.html',
  styles: `
    ion-fab {
      margin-bottom: var(--ion-safe-area-bottom, 0);
    }
  `,
  imports: [RouterLink, IonRouterLink, IonHeader, IonToolbar,
            IonTitle, IonContent, IonButtons, IonBackButton,
            IonButton, IonIcon, IonCard, IonCardHeader,
            IonCardTitle, IonCardContent, IonChip, IonFab,
            IonFabButton, IonGrid, IonRow, IonCol],
})
export class TourPage {
  private readonly tours = inject(TourService);
  private readonly favorites = inject(FavoritesService);
  private readonly animations = inject(AnimationController);

  private readonly heart =
    viewChild.required('heart', { read: ElementRef });

  readonly id = input.required<string>();
  readonly tour = computed(() => this.tours.byId(this.id()));

  readonly isFavorite =
    computed(() => this.favorites.all().includes(this.id()));

  constructor() {
    addIcons({ heart, heartOutline, timeOutline,
               peopleOutline, cashOutline,
               paperPlaneOutline });
  }

  toggleFavorite() {
    this.favorites.toggle(this.id());
    this.beat(this.isFavorite() ? 1.5 : 0.6);
  }

  private beat(peak: number) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    this.animations
      .create()
      .addElement(this.heart().nativeElement)
      .duration(350)
      .keyframes([
        { offset: 0, transform: 'scale(1)' },
        { offset: 0.4, transform: `scale(${peak})` },
        { offset: 1, transform: 'scale(1)' },
      ])
      .play();
  }
}
