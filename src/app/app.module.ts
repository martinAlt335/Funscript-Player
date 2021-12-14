import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {VideoPlayerModule} from './video-player/video-player.module';
import {UserInputComponent} from './user-input/user-input.component';
import {ButtplugComponent} from './buttplug/buttplug.component';
import {HotToastModule} from '@ngneat/hot-toast';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FunscriptHeatmapModule} from './funscript-heatmap/funscript-heatmap.module';
import { ThemeToggleButtonComponent } from './theme-toggle-button/theme-toggle-button.component';
import { NZ_I18N } from 'ng-zorro-antd/i18n';
import { en_US } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { HttpClientModule } from '@angular/common/http';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzSwitchModule} from 'ng-zorro-antd/switch';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzBreadCrumbModule} from 'ng-zorro-antd/breadcrumb';
import {NzCardModule} from 'ng-zorro-antd/card';

registerLocaleData(en);

@NgModule({
  declarations: [AppComponent, UserInputComponent, ButtplugComponent, ThemeToggleButtonComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    VideoPlayerModule,
    HotToastModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    FunscriptHeatmapModule,
    HttpClientModule,
    NzButtonModule,
    NzSwitchModule,
    NzFormModule,
    NzInputModule,
    NzBreadCrumbModule,
    NzCardModule
  ],
  providers: [{ provide: NZ_I18N, useValue: en_US }],
  bootstrap: [AppComponent],
})
export class AppModule {}
