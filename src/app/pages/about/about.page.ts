import { Component, signal } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent,
         IonButtons, IonMenuButton, IonCheckbox }
        from '@ionic/angular';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  imports: [IonHeader, IonToolbar, IonTitle, IonContent,
            IonButtons, IonMenuButton, IonCheckbox],
})
export class AboutPage {
  readonly notify = signal(false);
}
