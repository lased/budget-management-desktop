import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/api';

import { TypeFnsForm, FnsRequestError } from '@shared/components/fns/fns.interface';

@Component({
    selector: 'app-fns-dialog',
    template: `
        <p-message *ngIf="message" severity="info" [text]="message"></p-message>
        <app-fns-form [(type)]="type"
            (closeEvent)="close()"
            (successEvent)="close($event)"
            (errorEvent)="close($event)">
        </app-fns-form>
    `
})
export class FnsDialogComponent implements OnInit {
    message: string;

    private _type: TypeFnsForm = 'login';
    get type() {
        return this._type;
    }
    set type(type: TypeFnsForm) {
        this._type = type;
        this.message = '';
    }

    constructor(
        private dialogRef: DynamicDialogRef,
        private config: DynamicDialogConfig,
    ) { }

    ngOnInit(): void {
        if (this.config.data.type) {
            this.type = this.config.data.type;
        }
    }

    close(res?: HttpResponse<any> | FnsRequestError) {
        if (res instanceof HttpResponse && res.status === 204) {
            this.type = 'login';
            this.message = 'Теперь вы можете авторизоваться';
        } else {
            this.dialogRef.close(res);
        }
    }
}
