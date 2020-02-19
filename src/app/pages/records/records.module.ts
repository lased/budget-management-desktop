import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/shared/shared.module';
import { RecordsRoutingModule } from './records-routing.module';
import { RecordsComponent } from './records.component';
import { RecordManageComponent } from './manage/manage.component';
import { QrDialogComponent } from './qr-dialog/qr-dialog.component';
import { FnsDialogComponent } from './fns-dialog/fns-dialog.component';

@NgModule({
  declarations: [
    RecordsComponent,
    RecordManageComponent,
    QrDialogComponent,
    FnsDialogComponent
  ],
  imports: [
    SharedModule,
    RecordsRoutingModule
  ],
  entryComponents: [QrDialogComponent, FnsDialogComponent]
})
export class RecordsModule { }
