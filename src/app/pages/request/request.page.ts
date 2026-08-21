import { Component, input } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent,
         IonButtons, IonBackButton }
        from '@ionic/angular';

@Component({
  selector: 'app-request',
  templateUrl: './request.page.html',
  imports: [IonHeader, IonToolbar, IonTitle, IonContent,
            IonButtons, IonBackButton],
})
export class RequestPage {
  readonly id = input.required<string>();
}
