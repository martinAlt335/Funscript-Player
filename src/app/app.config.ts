import { ApplicationConfig, ErrorHandler } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { DiagnosticService } from "ngx-roast-me";
import { en_US, provideNzI18n } from "ng-zorro-antd/i18n";

registerLocaleData(en);

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideAnimations(),
    provideNzI18n(en_US),
    {
      provide: ErrorHandler,
      useClass: DiagnosticService
    }
  ],
};
