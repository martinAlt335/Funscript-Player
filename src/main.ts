import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { buttplugInit } from 'buttplug';
import { devTools } from '@ngneat/elf-devtools';
import { enableElfProdMode } from '@ngneat/elf';

if (environment.production) {
  enableProdMode();
  enableElfProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .then(() => {
    if (!environment.production) {
      devTools();
    }
  })
  .catch((err) => console.error(err));

buttplugInit().then();
