import { inject, isDevMode, provideAppInitializer }
        from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withComponentInputBinding, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';
import { provideSignalFormsConfig }
        from '@angular/forms/signals';
import { NG_STATUS_CLASSES }
        from '@angular/forms/signals/compat';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { ThemeService } from './app/services/theme.service';
import { FavoritesService }
        from './app/services/favorites.service';
import { provideServiceWorker }
        from '@angular/service-worker';
import { Capacitor } from '@capacitor/core';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({
      animated: !window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches,
    }),
    provideSignalFormsConfig({ classes: NG_STATUS_CLASSES }),
    provideAppInitializer(async () => {
      const theme = inject(ThemeService);
      const favorites = inject(FavoritesService);
      await theme.restore();
      await favorites.restore();
    }),
    provideRouter(routes, withPreloading(PreloadAllModules), withComponentInputBinding()),
    // Only the web delivery benefits from a cache. A shell
    // already carries its files, and on Android the worker
    // would serve the previous version on the first start
    // after an update.
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode() && !Capacitor.isNativePlatform(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
});
