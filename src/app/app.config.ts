import { ApplicationConfig, ErrorHandler } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { DiagnosticService } from "ngx-roast-me";

registerLocaleData(en);

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(), provideAnimations(), {
    provide: ErrorHandler,
    useClass: DiagnosticService
  }],
};
