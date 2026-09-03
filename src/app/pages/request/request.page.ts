import { Component, computed, inject, input, signal }
        from '@angular/core';
import { email, form, FormField, required }
        from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent,
         IonButtons, IonBackButton, IonAccordion,
         IonAccordionGroup, IonItem, IonLabel,
         IonBreadcrumbs, IonBreadcrumb, IonDatetime,
         IonDatetimeButton, IonModal,
         IonInput, IonTextarea, IonButton, IonRouterLink,
         IonSelect, IonSelectOption, IonToggle }
        from '@ionic/angular';
import { TourService } from '../../services/tour.service';
import { TourRequest } from '../../models/request';
import { GroupSizeComponent } from './group-size.component';

const inDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

@Component({
  selector: 'app-request',
  templateUrl: './request.page.html',
  imports: [FormField, RouterLink, IonRouterLink,
            IonHeader,
            IonToolbar, IonTitle, IonContent, IonButtons,
            IonBackButton, IonAccordion, IonAccordionGroup,
            IonItem, IonLabel, IonBreadcrumbs,
            IonBreadcrumb, IonDatetime, IonDatetimeButton,
            IonModal, GroupSizeComponent,
            IonButton, IonInput, IonTextarea,
            IonSelect, IonSelectOption, IonToggle],
})
export class RequestPage {
  private readonly tours = inject(TourService);

  readonly id = input.required<string>();
  readonly tour = computed(() => this.tours.byId(this.id()));

  readonly earliest = inDays(7);
  readonly latest = inDays(365);

  readonly request = signal<TourRequest>({
    date: `${this.earliest}T09:30:00`,
    people: 1,
    firstName: '',
    lastName: '',
    email: '',
    message: '',
    language: 'de',
    bus: false,
    pickUp: '',
  });

  readonly requestForm = form(this.request, (p) => {
    required(p.firstName);
    required(p.lastName);
    required(p.email);
    email(p.email);
  });

  readonly languages = [
    { code: 'de', name: 'German' },
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
  ];

  readonly price = computed(() => {
    const tour = this.tour();
    if (!tour) {
      return 0;
    }
    return this.request().language === 'de'
      ? tour.price
      : tour.priceForeign;
  });

  readonly groupSizes = computed(() =>
    Array.from(
      { length: this.tour()?.maxPersons ?? 0 },
      (_, i) => i + 1,
    ),
  );

}
