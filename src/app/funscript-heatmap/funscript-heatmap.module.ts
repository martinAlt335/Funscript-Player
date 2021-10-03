import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FunscriptHeatmapComponent} from './funscript-heatmap.component';
import {MatSliderModule} from "@angular/material/slider";
import {FormsModule} from "@angular/forms";

@NgModule({
  declarations: [FunscriptHeatmapComponent],
  exports: [FunscriptHeatmapComponent],
  imports: [CommonModule, BrowserAnimationsModule, MatSliderModule, FormsModule],
})
export class FunscriptHeatmapModule {}
