import { ApplicationConfig } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

registerLocaleData(en);

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(), provideAnimations()],
};
