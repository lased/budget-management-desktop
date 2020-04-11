import { NgModule } from '@angular/core';

import { SharedModule } from '@shared/shared.module';
import { RecordsRoutingModule } from './records-routing.module';
import { RecordsComponent } from './records.component';
import { RecordManageComponent } from './manage/manage.component';
import { QrDialogComponent } from './qr-dialog/qr-dialog.component';
import { FnsDialogComponent } from './fns-dialog/fns-dialog.component';
import { ProductsComponent } from './manage/products/products.component';
import { ProductManageComponent } from './manage/products/manage/manage.component';

@NgModule({
  declarations: [
    RecordsComponent,
    RecordManageComponent,
    QrDialogComponent,
    FnsDialogComponent,
    ProductsComponent,
    ProductManageComponent
  ],
  imports: [
    SharedModule,
    RecordsRoutingModule
  ],
  entryComponents: [
    QrDialogComponent,
    FnsDialogComponent,
    ProductManageComponent
  ]
})
export class RecordsModule { }
