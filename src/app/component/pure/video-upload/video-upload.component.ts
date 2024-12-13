import { Component, EventEmitter, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
  NzUploadChangeParam,
  NzUploadComponent,
  NzUploadXHRArgs,
} from "ng-zorro-antd/upload";
import { NzIconDirective } from "ng-zorro-antd/icon";
import { NzButtonComponent } from "ng-zorro-antd/button";
import { NzInputDirective } from "ng-zorro-antd/input";
import { NzTagComponent } from "ng-zorro-antd/tag";
import { Subscription } from "rxjs";

@Component({
  selector: "app-video-upload",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzUploadComponent,
    NzIconDirective,
    NzButtonComponent,
    NzInputDirective,
    NzTagComponent,
  ],
  templateUrl: "./video-upload.component.html",
  styleUrls: ["./video-upload.component.scss"],
})
export class VideoUploadComponent {
  @Output() videoSelected = new EventEmitter<{
    fileName?: string;
    videoUrl: string;
  }>();

  @Output() videoDeleted = new EventEmitter<void>(); // Emit when video is deleted

  sourceUrl: string = "";
  videoFileName?: string; // Track the uploaded video file name

  customRequest(item: NzUploadXHRArgs) {
    setTimeout(() => {
      return item.onSuccess?.({ status: "success" }, item.file, undefined);
    }, 10);
    return new Subscription();
  }

  handleFileUpload({ file }: NzUploadChangeParam): void {
    if (file.status === "done") {
      if (file.originFileObj) {
        const url = URL.createObjectURL(file.originFileObj);
        this.videoSelected.emit({ fileName: file.name, videoUrl: url });
        this.videoFileName = file.name;
      }
    }
  }

  onUrlSubmit(): void {
    if (this.sourceUrl.trim()) {
      this.videoSelected.emit({ videoUrl: this.sourceUrl.trim() });
      this.videoFileName = "URL Video";
    }
  }

  deleteVideo(): void {
    this.videoFileName = undefined;
    this.sourceUrl = "";
    this.videoSelected.emit({ videoUrl: "" });
    this.videoDeleted.emit();
  }
}
