import { Component, computed, inject, input }
        from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent,
         IonButtons, IonBackButton, IonButton, IonIcon,
         IonRouterLink }
        from '@ionic/angular';
import { addIcons } from 'ionicons';
import { heart, heartOutline } from 'ionicons/icons';
import { TourService } from '../../services/tour.service';
import { FavoritesService }
        from '../../services/favorites.service';

@Component({
  selector: 'app-tour',
  templateUrl: './tour.page.html',
  imports: [RouterLink, IonRouterLink, IonHeader, IonToolbar,
            IonTitle, IonContent, IonButtons, IonBackButton,
            IonButton, IonIcon],
})
export class TourPage {
  private readonly tours = inject(TourService);
  private readonly favorites = inject(FavoritesService);

  readonly id = input.required<string>();
  readonly tour = computed(() => this.tours.byId(this.id()));

  readonly isFavorite =
    computed(() => this.favorites.all().includes(this.id()));

  constructor() {
    addIcons({ heart, heartOutline });
  }

  toggleFavorite() {
    this.favorites.toggle(this.id());
  }
}
