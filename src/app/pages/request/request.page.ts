import { Component, LOCALE_ID, computed, inject, input,
         signal } from '@angular/core';
import { applyWhen, email, form, FormField, maxLength,
         required, submit }
        from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent,
         IonButtons, IonBackButton, IonAccordion,
         IonAccordionGroup, IonItem, IonLabel, IonList,
         IonNote,
         IonBreadcrumbs, IonBreadcrumb, IonDatetime,
         IonDatetimeButton, IonModal,
         IonInput, IonTextarea, IonButton, IonRouterLink,
         IonText, IonIcon,
         IonSelect, IonSelectOption, IonToggle,
         ToastController, NavController }
        from '@ionic/angular';
import { addIcons } from 'ionicons';
import { sparklesOutline } from 'ionicons/icons';
import { TourService } from '../../services/tour.service';
import { RequestService }
        from '../../services/request.service';
import { NetworkService }
        from '../../services/network.service';
import { ConsentService }
        from '../../services/consent.service';
import { Draft, TourRequest } from '../../models/request';
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
            IonSelect, IonSelectOption, IonToggle, IonIcon],
})
export class RequestPage {
  private readonly tours = inject(TourService);
  private readonly requests = inject(RequestService);
  private readonly toasts = inject(ToastController);
  private readonly nav = inject(NavController);
  readonly network = inject(NetworkService);
  readonly consent = inject(ConsentService);

  // ion-datetime follows the device, not the app.
  readonly locale = inject(LOCALE_ID);
  readonly firstDayOfWeek = this.locale === 'de' ? 1 : 0;

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
    { code: 'de', name: $localize`:@@language.de:German` },
    { code: 'en', name: $localize`:@@language.en:English` },
    { code: 'fr', name: $localize`:@@language.fr:French` },
    { code: 'es', name: $localize`:@@language.es:Spanish` },
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

  // The same limit as the API's.
  readonly maxSentence = 300;
  readonly sentence = form(signal(''), (p) => {
    maxLength(p, this.maxSentence);
  });
  readonly drafting = signal(false);
  readonly reading = signal(false);
  readonly unreadable = signal(false);

  constructor() {
    addIcons({ sparklesOutline });
  }

  private payload(): TourRequest {
    const request = this.request();
    return request.bus
      ? request
      : { ...request, pickUp: '' };
  }

  private async confirm() {
    const toast = await this.toasts.create({
      message: $localize`:@@request.sent:Request sent. We answer
        within one working day.`,
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

  async fillIn() {
    this.unreadable.set(false);
    this.reading.set(true);
    try {
      const draft = await this.requests.draft(
        this.sentence().value().trim(), inDays(0));
      this.apply(draft);
      this.drafting.set(false);
    } catch {
      this.unreadable.set(true);
    } finally {
      this.reading.set(false);
    }
  }

  // Switching it on is the consent; off withdraws it.
  async allow(on: boolean) {
    await (on ? this.consent.give() : this.consent.withdraw());
  }

  // Only what the form's own controls could have produced.
  // Anything else keeps its value.
  private apply(draft: Draft) {
    const form = this.requestForm;
    const { people, date, time, bus, pickUp, language,
            firstName, lastName } = draft;
    if (people !== null
        && this.groupSizes().includes(people)) {
      form.people().value.set(people);
      form.people().markAsDirty();
    }
    const current = this.request().date
      ?? `${this.earliest}T09:30:00`;
    const day = date !== null && date >= this.earliest
      && date <= this.latest ? date : current.slice(0, 10);
    // The picker offers 9:00 to 17:30 in half hours.
    const clock = time !== null
      && /^(09|1[0-7]):(00|30)$/.test(time)
      ? time : current.slice(11, 16);
    if (`${day}T${clock}:00` !== current) {
      form.date().value.set(`${day}T${clock}:00`);
      form.date().markAsDirty();
    }
    if (bus || pickUp) {
      form.bus().value.set(true);
      form.bus().markAsDirty();
    }
    if (pickUp) {
      form.pickUp().value.set(pickUp);
      form.pickUp().markAsDirty();
    }
    if (language !== null) {
      form.language().value.set(language);
      form.language().markAsDirty();
    }
    if (firstName) {
      form.firstName().value.set(firstName);
      form.firstName().markAsDirty();
    }
    if (lastName) {
      form.lastName().value.set(lastName);
      form.lastName().markAsDirty();
    }
  }

  readonly groupSizes = computed(() =>
    Array.from(
      { length: this.tour()?.maxPersons ?? 0 },
      (_, i) => i + 1,
    ),
  );

}
