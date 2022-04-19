import { NgModule } from '@angular/core';
import { ConfigRepository } from './config.repository';
import { ConfigQuery } from './config.query';
import { ConfigService } from './config.service';

@NgModule({
  providers: [ConfigRepository, ConfigQuery, ConfigService],
})
export class ConfigModule {}
