import { Component, computed, inject, input, signal }
        from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent,
         IonButtons, IonBackButton, IonAccordion,
         IonAccordionGroup, IonItem, IonLabel,
         IonBreadcrumbs, IonBreadcrumb, IonDatetime,
         IonPicker, IonPickerColumn, IonPickerColumnOption,
         IonRouterLink }
        from '@ionic/angular';
import { TourService } from '../../services/tour.service';
import { TourRequest } from '../../models/request';

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
  imports: [RouterLink, IonRouterLink, IonHeader,
            IonToolbar, IonTitle, IonContent, IonButtons,
            IonBackButton, IonAccordion, IonAccordionGroup,
            IonItem, IonLabel, IonBreadcrumbs,
            IonBreadcrumb, IonDatetime, IonPicker,
            IonPickerColumn, IonPickerColumnOption],
})
export class RequestPage {
  private readonly tours = inject(TourService);

  readonly id = input.required<string>();
  readonly tour = computed(() => this.tours.byId(this.id()));

  readonly earliest = inDays(7);
  readonly latest = inDays(365);

  readonly request = signal<TourRequest>({
    date: null,
    people: 1,
  });

  readonly groupSizes = computed(() =>
    Array.from(
      { length: this.tour()?.maxPersons ?? 0 },
      (_, i) => i + 1,
    ),
  );

  setDate(value: string | string[] | null | undefined) {
    this.request.update((r) => ({
      ...r,
      date: typeof value === 'string' ? value : null,
    }));
  }

  setPeople(value: string | number | undefined) {
    this.request.update((r) => ({
      ...r,
      people: typeof value === 'number' ? value : r.people,
    }));
  }
}
