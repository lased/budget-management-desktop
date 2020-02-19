import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { RecordsComponent } from './records.component';
import { RecordManageComponent } from './manage/manage.component';

const routes: Routes = [
    { path: '', component: RecordsComponent },
    { path: 'create', component: RecordManageComponent },
    { path: 'update/:id', component: RecordManageComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class RecordsRoutingModule {}
