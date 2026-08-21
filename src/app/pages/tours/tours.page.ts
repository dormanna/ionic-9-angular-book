import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent,
         IonButtons, IonMenuButton, IonList, IonItem,
         IonLabel, IonNote, IonRouterLink }
        from '@ionic/angular';
import { TourService } from '../../services/tour.service';

@Component({
  selector: 'app-tours',
  templateUrl: './tours.page.html',
  imports: [RouterLink, IonRouterLink, IonHeader, IonToolbar,
            IonTitle, IonContent, IonButtons, IonMenuButton,
            IonList, IonItem, IonLabel, IonNote],
})
export class ToursPage {
  private readonly service = inject(TourService);

  readonly tours = this.service.all();
  readonly isLoading = this.service.isLoading;
  readonly error = this.service.error;
}
