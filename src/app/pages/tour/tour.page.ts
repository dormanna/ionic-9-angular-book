import { Component, computed, inject, input }
        from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent,
         IonButtons, IonBackButton, IonButton, IonLabel }
        from '@ionic/angular';
import { TourService } from '../../services/tour.service';

@Component({
  selector: 'app-tour',
  templateUrl: './tour.page.html',
  imports: [RouterLink, IonHeader, IonToolbar, IonTitle,
            IonContent, IonButtons, IonBackButton, IonButton,
            IonLabel],
})
export class TourPage {
  private readonly tours = inject(TourService);
  readonly id = input.required<string>();
  readonly tour = computed(() => this.tours.byId(this.id()));

  ngOnInit() { console.log('Tour ngOnInit', this.id()); }
  ngOnDestroy() { console.log('Tour ngOnDestroy'); }
  ionViewWillEnter() {
    console.log('Tour ionViewWillEnter', this.id());
  }
  ionViewDidEnter() { console.log('Tour ionViewDidEnter'); }
  ionViewWillLeave() { console.log('Tour ionViewWillLeave'); }
  ionViewDidLeave() { console.log('Tour ionViewDidLeave'); }
}
