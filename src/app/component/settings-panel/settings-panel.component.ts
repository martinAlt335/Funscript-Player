import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigRepository } from "../../state/config/config.repository";
import { NzTabComponent, NzTabDirective, NzTabSetComponent } from "ng-zorro-antd/tabs";
import { NzAlertComponent } from "ng-zorro-antd/alert";
import { NzInputNumberComponent } from "ng-zorro-antd/input-number";
import { NzSliderComponent } from "ng-zorro-antd/slider";
import { FormsModule } from "@angular/forms";

@Component({
    selector: 'app-settings-panel',
    standalone: true,
    imports: [
        CommonModule,
        NzTabSetComponent,
        NzAlertComponent,
        NzInputNumberComponent,
        NzSliderComponent,
        NzTabComponent,
        NzTabDirective,
        FormsModule,
    ],
    template: `
        <nz-tabset [nzAnimated]="false">
            <!-- TAB 1: Timing Offset -->
            <nz-tab nzTitle="Sync Adjustment">
                <ng-template nz-tab>
                    <div class="tab-content min-h-[540px] md:min-h-[280px]">
                        <div class="md:flex md:gap-x-7 items-center justify-between mt-4">
                            <div>
                                <h4 class="mb-2">Sync Adjustment (ms)</h4>
                                <p class="text-sm text-gray-300">
                                    This shifts <strong>when</strong> the actions from your script
                                    are triggered.<br />
                                    - A
                                    <strong class="text-pink-500">negative</strong> value fires
                                    commands <em>earlier</em> than normal.<br />
                                    - A
                                    <strong class="text-orange-500">positive</strong> value fires
                                    commands <em>later</em> than normal.<br /><br />
                                    <strong class="text-blue-500">Use this setting</strong> if
                                    your device’s movement starts too soon or too late compared to
                                    what you see on the screen. Adjusting this tries to match your
                                    device’s motion timing to the onscreen events.
                                </p>
                            </div>
                            <div class="flex items-center">
                                <nz-input-number
                                        [ngModel]="scriptTimingOffsetMs"
                                        (ngModelChange)="onTimingOffsetChange($event)"
                                        [nzStep]="100"
                                        [nzPrecision]="0"
                                        [nzFormatter]="formatter"
                                        [nzParser]="parser"
                                        style="width: 120px;"
                                        aria-label="Script to Device Offset Input"
                                        [ngClass]="{
                    'text-pink-500': scriptTimingOffsetMs < 0,
                    'text-orange-500': scriptTimingOffsetMs > 0
                  }"
                                ></nz-input-number>
                                <span class="ml-2 text-sm text-gray-400">(ms)</span>
                            </div>
                        </div>
                        <p class="text-xs text-gray-400 mt-2">
                            Example: Enter <strong>-1000</strong> ms to trigger actions 1
                            second earlier.
                        </p>

                        <nz-alert
                                nzType="info"
                                nzMessage="If your device’s actions line up too soon or too late, adjust this offset to compensate."
                                nzShowIcon
                                class="mt-3"
                        ></nz-alert>
                    </div>
                </ng-template>
            </nz-tab>

            <!-- TAB 2: Device Response Delay -->
            <nz-tab nzTitle="Device Response">
                <ng-template nz-tab>
                    <div class="tab-content min-h-[540px] md:min-h-[280px]">
                        <div class="md:flex md:gap-x-7 items-center justify-between mt-4">
                            <div>
                                <h4 class="mb-2">Device Response (ms)</h4>
                                <p class="text-sm text-gray-300">
                                    This modifies <strong>how long</strong> each movement takes,
                                    effectively compensating for a device's built-in lag or speed
                                    limits.<br /><br />
                                    - A <strong class="text-pink-500">negative</strong> value
                                    shortens each stroke’s duration (makes your device move more
                                    quickly).<br />
                                    - A <strong class="text-orange-500">positive</strong> value
                                    lengthens each stroke’s duration, giving slower devices more
                                    time to finish each movement.<br /><br />
                                    <strong class="text-blue-500">Use this setting</strong> if
                                    your device physically cannot complete movements quickly
                                    enough (or too quickly) to match the script’s timing. You’re
                                    compensating for actual device movement speed.
                                </p>
                            </div>

                            <div class="flex items-center">
                                <nz-input-number
                                        [ngModel]="deviceResponseDelay"
                                        (ngModelChange)="onDeviceResponseDelayChange($event)"
                                        [nzStep]="100"
                                        [nzPrecision]="0"
                                        [nzFormatter]="formatter"
                                        [nzParser]="parser"
                                        style="width: 120px;"
                                        aria-label="Device Response Delay Slider"
                                        [ngClass]="{
                    'text-pink-500': deviceResponseDelay < 0,
                    'text-orange-500': deviceResponseDelay > 0
                  }"
                                ></nz-input-number>
                                <span class="ml-2 text-sm text-gray-400">(ms)</span>
                            </div>
                        </div>

                        <p class="text-xs text-gray-400 mt-3">
                            Example: Enter <strong>1000</strong> to add 1 second to each
                            stroke’s duration for slower devices.
                        </p>

                        <nz-alert
                                nzType="info"
                                nzMessage="Tweak this if your device physically lags behind or rushes through movements."
                                nzShowIcon
                                class="mt-3"
                        ></nz-alert>
                    </div>
                </ng-template>
            </nz-tab>

            <!-- TAB 3: Stroke Range -->
            <nz-tab nzTitle="Stroke Range">
                <ng-template nz-tab>
                    <div class="tab-content min-h-[540px] md:min-h-[280px]">
                        <div class="md:flex md:gap-x-7 items-center justify-between mt-4">
                            <div>
                                <h4 class="mb-2">Stroke Range (%)</h4>
                                <p class="text-sm text-gray-300">
                                    Adjust the maximum stroke length for linear devices. Default
                                    is 100% for a full range of movement.
                                </p>
                            </div>
                            <div class="flex items-center">
                                <nz-slider
                                        [ngModel]="strokeRange"
                                        (ngModelChange)="onStrokeRangeChange($event)"
                                        [nzMin]="1"
                                        [nzMax]="100"
                                        nzTooltipVisible="never"
                                        style="width: 150px;"
                                        aria-label="Stroke Range Slider"
                                ></nz-slider>
                                <span class="ml-3 text-sm text-gray-400"
                                >{{ strokeRange }}%</span
                                >
                            </div>
                        </div>
                    </div>
                </ng-template>
            </nz-tab>
        </nz-tabset>
  `
})
export class SettingsPanelComponent {
    @Input() scriptTimingOffsetMs: number = 0;
    @Input() deviceResponseDelay: number = 0;
    @Input() strokeRange: number = 100;

    constructor(private configRepo: ConfigRepository) {}

    onTimingOffsetChange(newOffset: number) {
        this.configRepo.updateState({ scriptTimingOffsetMs: newOffset });
    }

    onDeviceResponseDelayChange(newVal: number) {
        this.configRepo.updateState({ deviceResponseDelayMs: newVal });
    }

    onStrokeRangeChange(newVal: number) {
        this.configRepo.updateState({ strokeRange: newVal });
    }

    formatter = (value: number): string => `${value}`;
    parser = (value: string): string => value;
}
