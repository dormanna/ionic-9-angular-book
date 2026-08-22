import { Component, computed, inject, input, signal }
        from '@angular/core';
import { RouterLink } from '@angular/router';
import { ActionSheetController, IonHeader, IonToolbar,
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

  private readonly sheets = inject(ActionSheetController);
  readonly chosen = signal('');

  async openActions() {
    const sheet = await this.sheets.create({
      header: this.tour()?.title,
      buttons: [
        { text: 'Request this tour', role: 'request' },
        { text: 'Remember this tour', role: 'remember' },
        { text: 'Cancel', role: 'cancel' },
      ],
    });
    await sheet.present();

    const { role } = await sheet.onDidDismiss();
    this.chosen.set(role ?? '');
  }
}
