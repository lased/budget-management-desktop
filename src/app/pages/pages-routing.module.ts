import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { PagesComponent } from './pages.component';

const routes: Routes = [
    {
        path: '', component: PagesComponent, children: [
            { path: 'users', loadChildren: () => import('./users/users.module').then(m => m.UsersModule) },
            { path: 'categories', loadChildren: () => import('./categories/categories.module').then(m => m.CategoriesModule) },
            { path: 'records', loadChildren: () => import('./records/records.module').then(m => m.RecordsModule) },
            { path: 'analyze', loadChildren: () => import('./analyze/analyze.module').then(m => m.AnalyzeModule) },
            { path: '**', redirectTo: 'analyze', pathMatch: 'full' }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PagesRoutingModule { }
