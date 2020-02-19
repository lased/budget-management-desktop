import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { CategoriesComponent } from './categories.component';
import { CategoryManageComponent } from './manage/manage.component';

const routes: Routes = [
    { path: '', component: CategoriesComponent },
    { path: 'create', component: CategoryManageComponent },
    { path: 'update/:id', component: CategoryManageComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CategoriesRoutingModule { }
