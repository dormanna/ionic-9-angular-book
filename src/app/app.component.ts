import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonApp, IonSplitPane, IonMenu, IonContent, IonList,
         IonNote, IonMenuToggle, IonItem,
         IonIcon, IonLabel, IonRouterOutlet, IonRouterLink,
         IonFooter, IonRadioGroup, IonRadio }
        from '@ionic/angular';
import { addIcons } from 'ionicons';
import { homeOutline, homeSharp, mapOutline, mapSharp,
         informationCircleOutline, informationCircleSharp }
        from 'ionicons/icons';
import { LogoComponent } from './pages/about/logo.component';
import { ThemeService, ThemeChoice }
        from './services/theme.service';

interface Appearance {
  value: ThemeChoice;
  title: string;
}

interface MenuEntry {
  title: string;
  url: string;
  icon: string;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [RouterLink, RouterLinkActive, IonApp, IonSplitPane,
            IonMenu, IonContent, IonList, IonNote,
            IonMenuToggle, IonItem, IonIcon, IonLabel,
            IonRouterLink, IonRouterOutlet,
            IonFooter, IonRadioGroup, IonRadio, LogoComponent],
})
export class AppComponent {
  readonly theme = inject(ThemeService);

  readonly appearances: Appearance[] = [
    { value: 'light', title: 'Light' },
    { value: 'dark', title: 'Dark' },
    { value: 'system', title: 'System default' },
  ];

  readonly pages: MenuEntry[] = [
    { title: 'Home', url: '/home', icon: 'home' },
    { title: 'Tours', url: '/tours', icon: 'map' },
    { title: 'About', url: '/about',
      icon: 'information-circle' },
  ];

  constructor() {
    addIcons({
      homeOutline, homeSharp,
      mapOutline, mapSharp,
      informationCircleOutline, informationCircleSharp,
    });
  }
}
