import { Component, computed, inject, input }
        from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent,
         IonButtons, IonBackButton, IonAccordion,
         IonAccordionGroup, IonItem, IonLabel }
        from '@ionic/angular';
import { TourService } from '../../services/tour.service';

@Component({
  selector: 'app-request',
  templateUrl: './request.page.html',
  imports: [IonHeader, IonToolbar, IonTitle, IonContent,
            IonButtons, IonBackButton, IonAccordion,
            IonAccordionGroup, IonItem, IonLabel],
})
export class RequestPage {
  private readonly tours = inject(TourService);
  readonly id = input.required<string>();
  readonly tour = computed(() => this.tours.byId(this.id()));
}
