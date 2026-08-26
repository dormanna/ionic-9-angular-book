import { Component, signal } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent,
         IonButtons, IonMenuButton, IonCheckbox }
        from '@ionic/angular';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.page.html',
  imports: [IonHeader, IonToolbar, IonTitle, IonContent,
            IonButtons, IonMenuButton, IonCheckbox],
})
export class DemoPage {
  readonly notify = signal(false);
}
