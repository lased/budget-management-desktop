import { Component } from '@angular/core';
import { DynamicDialogRef } from 'primeng/api';

import { QRData } from '@core/interfaces';

@Component({
    selector: 'app-qr-dialog',
    template: `
        <app-qr-scanner [updateTime]="300" (data)="dataFromQrCode($event)"></app-qr-scanner>
    `
})
export class QrDialogComponent {
    constructor(
        private dialogref: DynamicDialogRef
    ) { }

    dataFromQrCode(data: string) {
        const qrData = this.parseQrCode(data);

        this.dialogref.close(qrData);
    }

    parseQrCode(data: string): QRData {
        try {
            const qrData: QRData = {};

            data.split('&').forEach(row => {
                const [name, value] = row.split('=');

                qrData[name] = value;
            });

            qrData.s = +qrData.s;
            qrData.n = +qrData.n;
            qrData.t = qrData.t.replace(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/, '$1-$2-$3T$4:$5:$6');
            qrData.s *= 100;

            return qrData;
        } catch (_) {
            return null;
        }
    }
}
