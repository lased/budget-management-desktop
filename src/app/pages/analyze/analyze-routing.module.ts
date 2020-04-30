import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { ExpensesAndIncomesAnalyzeComponent } from './expenses-and-incomes/expenses-and-incomes.component';
import { ForecastAnalyzeComponent } from './forecast/forecast.component';
import { AnalyzeComponent } from './analyze.component';
import { ProductsAnalyzeComponent } from './products/products.component';
import { IndicatorsComponent } from './expenses-and-incomes/indicators/indicators.component';
import { CategoriesComponent } from './categories/categories.component';
import { RecordType } from '@core/interfaces';

const routes: Routes = [
    {
        path: '', component: AnalyzeComponent, children: [
            {
                path: 'expenses-and-incomes',
                component: ExpensesAndIncomesAnalyzeComponent,
                children: [
                    { path: 'indicators', component: IndicatorsComponent },
                    { path: 'categories/:type', component: CategoriesComponent },
                    { path: '**', redirectTo: 'indicators', pathMatch: 'full' }
                ]
            },
            {
                path: 'products',
                component: ProductsAnalyzeComponent,
                children: [
                    { path: 'categories/:type', component: CategoriesComponent, data: { products: true } },
                    { path: '**', redirectTo: `categories/${RecordType.expense}`, pathMatch: 'full' }
                ]
            },
            { path: 'forecast', component: ForecastAnalyzeComponent },
            { path: '**', redirectTo: 'expenses-and-incomes', pathMatch: 'full' }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AnalyzeRoutingModule { }
