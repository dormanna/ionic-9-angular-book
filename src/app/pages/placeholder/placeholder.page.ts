import { Component, input } from '@angular/core';
import { IonHeader, IonToolbar, IonButtons, IonMenuButton,
         IonTitle, IonContent }
        from '@ionic/angular';

@Component({
  selector: 'app-placeholder',
  templateUrl: './placeholder.page.html',
  imports: [IonHeader, IonToolbar, IonButtons, IonMenuButton,
            IonTitle, IonContent],
})
export class PlaceholderPage {
  readonly title = input.required<string>();
}
