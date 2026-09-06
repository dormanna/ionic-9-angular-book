import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent,
         IonButtons, IonMenuButton, IonButton,
         IonPopover }
        from '@ionic/angular';
import { LogoComponent } from './logo.component';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  imports: [IonHeader, IonToolbar, IonTitle, IonContent,
            IonButtons, IonMenuButton, IonButton,
            IonPopover, LogoComponent],
})
export class AboutPage {}
