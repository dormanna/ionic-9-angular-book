import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent,
         IonButtons, IonMenuButton, IonButton, IonRadio,
         IonRadioGroup }
        from '@ionic/angular';
import { TourService }
        from '../../services/tour.service';
import { LogoComponent } from '../about/logo.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
  imports: [RouterLink, IonHeader, IonToolbar, IonTitle,
            IonContent, IonButtons, IonMenuButton,
            IonButton, IonRadio, IonRadioGroup,
            LogoComponent],
})
export class HomePage {
  private readonly service = inject(TourService);
  private readonly router = inject(Router);

  readonly regions = this.service.regions;
  readonly region = signal('BN');

  showRegion() {
    this.router.navigate(['/tours'], {
      queryParams: { region: this.region() },
    });
  }
}
