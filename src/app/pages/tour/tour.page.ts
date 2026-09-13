import { Component, ElementRef, computed, inject, input,
         signal, viewChild }
        from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent,
         IonButtons, IonBackButton, IonButton, IonIcon,
         IonCard, IonCardHeader, IonCardTitle,
         IonCardContent, IonChip, IonFab, IonFabButton,
         IonFabList, IonGrid, IonRow, IonCol, IonRouterLink,
         AnimationController }
        from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { addIcons } from 'ionicons';
import { heart, heartOutline, timeOutline, peopleOutline,
         cashOutline, paperPlaneOutline, ellipsisHorizontal,
         shareSocialOutline, locationOutline, navigateOutline }
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
            IonFabButton, IonFabList, IonGrid, IonRow, IonCol],
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

  readonly favoriteLabel = computed(() =>
    this.isFavorite()
      ? $localize`:@@tour.unfavorite:Remove from favorites`
      : $localize`:@@tour.favorite:Add to favorites`);

  readonly canShare = signal(false);

  constructor() {
    addIcons({ heart, heartOutline, timeOutline,
               peopleOutline, cashOutline,
               paperPlaneOutline, ellipsisHorizontal,
               shareSocialOutline, locationOutline,
               navigateOutline });
    Share.canShare()
      .then(({ value }) => this.canShare.set(value));
  }

  openDirections() {
    const tour = this.tour();
    if (!tour) {
      return;
    }
    const { lat, lng, location } = tour.startingPoint;
    const url = Capacitor.getPlatform() === 'android'
      ? 'https://www.google.com/maps/search/?api=1'
        + `&query=${lat},${lng}`
      : `https://maps.apple.com/?ll=${lat},${lng}`
        + `&q=${encodeURIComponent(location)}`;
    window.open(url, '_blank');
  }

  async share() {
    const tour = this.tour();
    if (!tour) {
      return;
    }
    try {
      await Share.share({
        title: tour.title,
        text: tour.summary,
        dialogTitle: $localize`:@@tour.share:Share this tour`,
      });
    } catch {
      // Canceling and failing to share are both silent here.
    }
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
