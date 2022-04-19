import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { VideoPlayerModule } from './components/video-player/video-player.module';
import { LoadVideoComponent } from './components/load/load-video/load-video.component';
import { ButtplugComponent } from './components/buttplug/buttplug.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FunscriptHeatmapModule } from './components/funscript/funscript-heatmap/funscript-heatmap.module';
import { en_US, NZ_I18N } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { HttpClientModule } from '@angular/common/http';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzCardModule } from 'ng-zorro-antd/card';
import { UserFlowComponent } from './components/user-flow/user-flow.component';
import { LoadFunscriptComponent } from './components/load/load-funscript/load-funscript.component';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { FunscriptControllerComponent } from './components/funscript/funscript-controller/funscript-controller.component';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ConfigModule } from '../state/config/config.module';
import { NZ_APP_ICONS } from './config/icons';
import { SettingsModalComponent } from './components/settings/settings-modal/settings-modal.component';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTagModule } from 'ng-zorro-antd/tag';

registerLocaleData(en);

@NgModule({
  declarations: [
    AppComponent,
    LoadVideoComponent,
    ButtplugComponent,
    UserFlowComponent,
    LoadFunscriptComponent,
    FunscriptControllerComponent,
    SettingsModalComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ConfigModule,
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
    NzIconModule.forRoot(NZ_APP_ICONS),
    NzModalModule,
    NzTagModule,
  ],
  providers: [{ provide: NZ_I18N, useValue: en_US }],
  bootstrap: [AppComponent],
})
export class AppModule {}
