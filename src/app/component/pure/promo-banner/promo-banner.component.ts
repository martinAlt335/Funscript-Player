import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalService } from "ng-zorro-antd/modal";

type DismissData = { dismissedAt?: string };

const LS_KEY_DEFAULT = 'fp_neutral_banner_v1';

@Component({
    selector: 'app-promo-banner',
    standalone: true,
    imports: [CommonModule, NzButtonModule, NzIconModule],
    templateUrl: './promo-banner.component.html',
    styleUrls: ['./promo-banner.component.scss'],
})
export class PromoBannerComponent implements OnInit {
    @Input() localStorageKey = LS_KEY_DEFAULT;
    @Input() cooldownDays = 30;
    @Input() iconUrl?: string;
    @Input() websiteUrl = 'https://funplayer.app/';

    @ViewChild('infoTpl', { static: true }) infoTpl!: TemplateRef<unknown>;

    constructor(private modal: NzModalService) {}

    show = false;

    ngOnInit(): void {
        if (!this.shouldShow()) return;
        this.show = true
    }

    openInfo(): void {
        this.modal.create({
            nzContent: this.infoTpl,
            nzCentered: true,
            nzFooter: null,
            nzKeyboard: true,
            nzMaskClosable: true,
            nzStyle: { maxWidth: '560px', width: '92%' },
            nzBodyStyle: { maxHeight: '60vh', overflowY: 'auto' },
        });
    }

    private shouldShow(): boolean {
        try {
            const raw = localStorage.getItem(this.localStorageKey);
            if (!raw) return true;
            const data: DismissData = JSON.parse(raw);
            if (!data.dismissedAt) return true;
            if (this.cooldownDays <= 0) return false;
            const last = new Date(data.dismissedAt).getTime();
            return (Date.now() - last) / 86400000 >= this.cooldownDays;
        } catch {
            return true;
        }
    }

    dismiss(): void {
        try {
            const payload: DismissData = { dismissedAt: new Date().toISOString() };
            localStorage.setItem(this.localStorageKey, JSON.stringify(payload));
        } catch {}
        this.show = false;
    }
}
