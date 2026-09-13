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
import { LanguageService }
        from './services/language.service';

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
  readonly language = inject(LanguageService);

  readonly appearances: Appearance[] = [
    { value: 'light', title: $localize`:@@menu.light:Light` },
    { value: 'dark', title: $localize`:@@menu.dark:Dark` },
    { value: 'system',
      title: $localize`:@@menu.system:System default` },
  ];

  readonly pages: MenuEntry[] = [
    { title: $localize`:@@menu.home:Home`,
      url: '/home', icon: 'home' },
    { title: $localize`:@@menu.tours:Tours`,
      url: '/tours', icon: 'map' },
    { title: $localize`:@@menu.about:About`,
      url: '/about', icon: 'information-circle' },
  ];

  constructor() {
    addIcons({
      homeOutline, homeSharp,
      mapOutline, mapSharp,
      informationCircleOutline, informationCircleSharp,
    });
  }
}
