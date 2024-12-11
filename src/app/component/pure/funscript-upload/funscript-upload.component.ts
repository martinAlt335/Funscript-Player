import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzCardComponent } from 'ng-zorro-antd/card';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NzUploadChangeParam, NzUploadComponent } from 'ng-zorro-antd/upload';
import { NzWaveDirective } from 'ng-zorro-antd/core/wave';
import { Funscript } from 'funscript-utils/lib/types';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTagComponent } from 'ng-zorro-antd/tag';

@Component({
  selector: 'app-funscript-upload',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    NzButtonComponent,
    NzCardComponent,
    NzIconDirective,
    NzInputDirective,
    NzUploadComponent,
    NzWaveDirective,
    NzTagComponent,
  ],
  templateUrl: './funscript-upload.component.html',
  styleUrls: ['./funscript-upload.component.scss'],
})
export class FunscriptUploadComponent {
  @Output() funscriptFile = new EventEmitter<{
    fileName: string;
    funscript: Funscript;
  }>();
  @Output() funscriptDeleted = new EventEmitter<void>();

  fileName?: string;

  constructor(private message: NzMessageService) {}

  handleChange({ file }: NzUploadChangeParam): void {
    const status = file.status;

    if (status === 'done' || status === 'uploading') {
      if (file && file.originFileObj) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const funscript: Funscript = JSON.parse(reader.result as string);
            this.funscriptFile.emit({
              fileName: file.name,
              funscript: funscript,
            });
            this.fileName = file.name; // Set the uploaded file name
            this.message.success(
              `Funscript "${file.name}" loaded successfully.`
            );
          } catch (error) {
            this.message.error(`Failed to parse Funscript file: ${error}`);
          }
        };
        reader.readAsText(file.originFileObj);
      }
    }
  }

  deleteFunscript(): void {
    this.fileName = undefined;
    this.funscriptDeleted.emit();
    this.message.info('Funscript file has been removed.');
  }
}
