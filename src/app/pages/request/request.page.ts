import { Component, inject, input, signal } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent,
         IonButtons, IonBackButton, IonButton, IonList,
         IonItem, IonLabel, IonNote }
        from '@ionic/angular';
import { RequestService } from '../../services/request.service';

@Component({
  selector: 'app-request',
  templateUrl: './request.page.html',
  imports: [IonHeader, IonToolbar, IonTitle, IonContent,
            IonButtons, IonBackButton, IonButton, IonList,
            IonItem, IonLabel, IonNote],
})
export class RequestPage {
  private readonly requests = inject(RequestService);

  readonly id = input.required<string>();
  readonly sent = this.requests.all;
  readonly sending = signal(false);

  async send(): Promise<void> {
    this.sending.set(true);
    await this.requests.send({
      tourId: this.id(),
      name: 'Andreas',
      people: 2,
    });
    this.sending.set(false);
  }
}
