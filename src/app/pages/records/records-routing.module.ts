import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { RecordManageComponent } from './manage/manage.component';

const routes: Routes = [
    { path: 'create', component: RecordManageComponent },
    { path: 'update/:id', component: RecordManageComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class RecordsRoutingModule {}
