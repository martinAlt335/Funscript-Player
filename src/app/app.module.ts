import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { VideoPlayerModule } from './video-player/video-player.module';
import { LoadVideoComponent } from './load-video/load-video.component';
import { ButtplugComponent } from './buttplug/buttplug.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FunscriptHeatmapModule } from './funscript-heatmap/funscript-heatmap.module';
import { NZ_I18N } from 'ng-zorro-antd/i18n';
import { en_US } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { HttpClientModule } from '@angular/common/http';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzCardModule } from 'ng-zorro-antd/card';
import { UserFlowComponent } from './user-flow/user-flow.component';
import { LoadFunscriptComponent } from './load-funscript/load-funscript.component';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { FunscriptControllerComponent } from './funscript-controller/funscript-controller.component';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';

registerLocaleData(en);

@NgModule({
  declarations: [
    AppComponent,
    LoadVideoComponent,
    ButtplugComponent,
    UserFlowComponent,
    LoadFunscriptComponent,
    FunscriptControllerComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    VideoPlayerModule,
    FormsModule,
    ReactiveFormsModule,
    FunscriptHeatmapModule,
    HttpClientModule,
    NzButtonModule,
    NzSwitchModule,
    NzFormModule,
    NzInputModule,
    NzBreadCrumbModule,
    NzCardModule,
    NzRadioModule,
    NzSliderModule,
    NzDividerModule,
    NzIconModule,
  ],
  providers: [{ provide: NZ_I18N, useValue: en_US }],
  bootstrap: [AppComponent],
})
export class AppModule {}
