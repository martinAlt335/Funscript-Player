import { Component, EventEmitter, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { NzUploadChangeParam, NzUploadComponent, NzUploadXHRArgs, } from "ng-zorro-antd/upload";
import { NzIconDirective } from "ng-zorro-antd/icon";
import { NzButtonComponent } from "ng-zorro-antd/button";
import { NzInputDirective } from "ng-zorro-antd/input";
import { NzTagComponent } from "ng-zorro-antd/tag";
import { Subscription } from "rxjs";

@Component({
  selector: "app-media-upload",
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
  templateUrl: "./media-upload.component.html",
  styleUrls: ["./media-upload.component.scss"],
})
export class MediaUploadComponent {
  @Output() mediaSelected = new EventEmitter<{
    fileName?: string;
    mediaUrl: string;
  }>();

  @Output() mediaDeleted = new EventEmitter<void>(); // Emit when media is deleted

  sourceUrl: string = "";
  mediaFileName?: string; // Track the uploaded media file name

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
        this.mediaSelected.emit({ fileName: file.name, mediaUrl: url });
        this.mediaFileName = file.name;
      }
    }
  }

  onUrlSubmit(): void {
    if (this.sourceUrl.trim()) {
      this.mediaSelected.emit({ mediaUrl: this.sourceUrl.trim() });
      this.mediaFileName = "URL Media";
    }
  }

  deleteMedia(): void {
    this.mediaFileName = undefined;
    this.sourceUrl = "";
    this.mediaSelected.emit({ mediaUrl: "" });
    this.mediaDeleted.emit();
  }
}
