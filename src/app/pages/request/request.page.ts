import { Component, computed, inject, input, signal }
        from '@angular/core';
import { applyWhen, email, form, FormField, required,
         submit }
        from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent,
         IonButtons, IonBackButton, IonAccordion,
         IonAccordionGroup, IonItem, IonLabel, IonList,
         IonNote,
         IonBreadcrumbs, IonBreadcrumb, IonDatetime,
         IonDatetimeButton, IonModal,
         IonInput, IonTextarea, IonButton, IonRouterLink,
         IonText,
         IonSelect, IonSelectOption, IonToggle,
         ToastController, NavController }
        from '@ionic/angular';
import { TourService } from '../../services/tour.service';
import { RequestService }
        from '../../services/request.service';
import { NetworkService }
        from '../../services/network.service';
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
  styleUrl: './request.page.scss',
  imports: [FormField, RouterLink, IonRouterLink,
            IonHeader,
            IonToolbar, IonTitle, IonContent, IonButtons,
            IonBackButton, IonAccordion, IonAccordionGroup,
            IonItem, IonLabel, IonList, IonNote,
            IonBreadcrumbs,
            IonBreadcrumb, IonDatetime, IonDatetimeButton,
            IonModal, GroupSizeComponent,
            IonButton, IonInput, IonTextarea, IonText,
            IonSelect, IonSelectOption, IonToggle],
})
export class RequestPage {
  private readonly tours = inject(TourService);
  private readonly requests = inject(RequestService);
  private readonly toasts = inject(ToastController);
  private readonly nav = inject(NavController);
  readonly network = inject(NetworkService);

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
    applyWhen(p, (ctx) => ctx.value().bus, (q) => {
      required(q.pickUp);
    });
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

  readonly sending = signal(false);
  readonly failed = signal(false);

  private payload(): TourRequest {
    const request = this.request();
    return request.bus
      ? request
      : { ...request, pickUp: '' };
  }

  private async confirm() {
    const toast = await this.toasts.create({
      message: 'Request sent. We answer within one '
        + 'working day.',
      duration: 4000,
    });
    await toast.present();
  }

  async send() {
    this.failed.set(false);
    await submit(this.requestForm, async () => {
      if (!this.network.connected()) {
        return undefined;
      }
      this.sending.set(true);
      try {
        await this.requests.send(this.payload());
        await this.confirm();
        this.requestForm().reset();
        await this.nav.navigateBack(['/tours', this.id()]);
      } catch {
        this.failed.set(true);
      } finally {
        this.sending.set(false);
      }
      return undefined;
    });
  }

  readonly groupSizes = computed(() =>
    Array.from(
      { length: this.tour()?.maxPersons ?? 0 },
      (_, i) => i + 1,
    ),
  );

}
