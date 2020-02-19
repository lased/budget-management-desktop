import { Component, OnInit } from '@angular/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
    selector: 'app-qr-dialog',
    template: `
        <app-qr-scanner [updateTime]="300" (data)="dataFromQrCode($event)"></app-qr-scanner>
    `
})
export class QrDialogComponent implements OnInit {
    constructor(
        private dialogref: DynamicDialogRef
    ) { }

    ngOnInit(): void { }

    dataFromQrCode(data: string) {
        this.dialogref.close(data);
    }
}
