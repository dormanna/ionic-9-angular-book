import { Component, computed, inject, input, signal }
        from '@angular/core';
import { RouterLink } from '@angular/router';
import { AlertController, IonHeader, IonToolbar,
         IonTitle, IonContent, IonButtons, IonBackButton,
         IonButton, IonRouterLink } from '@ionic/angular';
import { TourService } from '../../services/tour.service';

@Component({
  selector: 'app-tour',
  templateUrl: './tour.page.html',
  imports: [RouterLink, IonRouterLink, IonHeader, IonToolbar,
            IonTitle, IonContent, IonButtons, IonBackButton,
            IonButton],
})
export class TourPage {
  private readonly tours = inject(TourService);
  readonly id = input.required<string>();
  readonly tour = computed(() => this.tours.byId(this.id()));

  private readonly alerts = inject(AlertController);
  readonly chosen = signal('');

  async askBeforeLeaving() {
    const alert = await this.alerts.create({
      header: 'Leave without sending?',
      message: 'Your request has not been sent yet.',
      buttons: [
        { text: 'Stay', role: 'cancel' },
        { text: 'Leave', role: 'destructive' },
      ],
    });
    await alert.present();

    const { role } = await alert.onDidDismiss();
    this.chosen.set(role ?? '');
  }
}
