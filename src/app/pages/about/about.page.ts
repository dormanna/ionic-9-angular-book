import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent,
         IonButtons, IonMenuButton }
        from '@ionic/angular';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  imports: [IonHeader, IonToolbar, IonTitle, IonContent,
            IonButtons, IonMenuButton],
})
export class AboutPage {}
