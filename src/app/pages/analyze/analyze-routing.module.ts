import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { ExpensesAndIncomesAnalyzeComponent } from './expenses-and-incomes/expenses-and-incomes.component';
import { CategoriesAnalyzeComponent } from './categories/categories.component';
import { ForecastAnalyzeComponent } from './forecast/forecast.component';
import { AnalyzeComponent } from './analyze.component';
import { ProductsAnalyzeComponent } from './products/products.component';

const routes: Routes = [
    {
        path: '', component: AnalyzeComponent, children: [
            { path: 'expenses-and-incomes', component: ExpensesAndIncomesAnalyzeComponent },
            { path: 'categories', component: CategoriesAnalyzeComponent },
            { path: 'forecast', component: ForecastAnalyzeComponent },
            { path: 'products', component: ProductsAnalyzeComponent },
            { path: '**', redirectTo: 'expenses-and-incomes', pathMatch: 'full' }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AnalyzeRoutingModule { }
