import { Component, OnInit } from '@angular/core';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { TypeFnsForm } from 'src/app/shared/components/fns/fns.interface';

@Component({
    selector: 'app-fns-dialog',
    template: `
        <p-message *ngIf="message" severity="info" [text]="message"></p-message>
        <app-fns-form [(type)]="type"
            (close)="close()"
            (success)="close($event)"
            (error)="close($event)">
        </app-fns-form>
    `
})
export class FnsDialogComponent implements OnInit {
    private _type: TypeFnsForm;
    get type() {
        return this._type;
    }
    set type(type: TypeFnsForm) {
        this._type = type;

        if (this.message && this.type !== 'login') {
            this.message = '';
        }
    }

    message: string;

    constructor(
        private dialogRef: DynamicDialogRef,
        private config: DynamicDialogConfig,
    ) { }

    ngOnInit(): void {
        this.type = this.config.data.type;
    }

    close(res?: HttpResponse<any> | HttpErrorResponse) {
        if (res instanceof HttpResponse && res.status !== 200) {
            this.type = 'login';
            this.message = 'Теперь вы можете войти';
        } else {
            this.dialogRef.close(res);
        }
    }
}
