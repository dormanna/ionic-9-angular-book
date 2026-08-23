import { Component, computed, inject, input }
        from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent,
         IonButtons, IonBackButton, IonAccordion,
         IonAccordionGroup, IonItem, IonLabel,
         IonBreadcrumbs, IonBreadcrumb, IonRouterLink }
        from '@ionic/angular';
import { TourService } from '../../services/tour.service';

@Component({
  selector: 'app-request',
  templateUrl: './request.page.html',
  imports: [RouterLink, IonRouterLink, IonHeader,
            IonToolbar, IonTitle, IonContent, IonButtons,
            IonBackButton, IonAccordion, IonAccordionGroup,
            IonItem, IonLabel, IonBreadcrumbs,
            IonBreadcrumb],
})
export class RequestPage {
  private readonly tours = inject(TourService);
  readonly id = input.required<string>();
  readonly tour = computed(() => this.tours.byId(this.id()));
}
