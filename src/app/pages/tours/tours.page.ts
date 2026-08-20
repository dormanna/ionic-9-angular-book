import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent,
         IonButtons, IonMenuButton, IonList, IonItem,
         IonLabel, IonNote }
        from '@ionic/angular';
import { TourService } from '../../services/tour.service';

@Component({
  selector: 'app-tours',
  templateUrl: './tours.page.html',
  imports: [RouterLink, IonHeader, IonToolbar, IonTitle,
            IonContent, IonButtons, IonMenuButton, IonList,
            IonItem, IonLabel, IonNote],
})
export class ToursPage {
  private readonly service = inject(TourService);
  readonly tours = this.service.all();

  ngOnInit() { console.log('Tours ngOnInit'); }
  ngOnDestroy() { console.log('Tours ngOnDestroy'); }
  ionViewWillEnter() { console.log('Tours ionViewWillEnter'); }
  ionViewDidEnter() { console.log('Tours ionViewDidEnter'); }
  ionViewWillLeave() { console.log('Tours ionViewWillLeave'); }
  ionViewDidLeave() { console.log('Tours ionViewDidLeave'); }
}
