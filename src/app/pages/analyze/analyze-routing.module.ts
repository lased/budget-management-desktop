import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { ExpensesAndIncomesAnalyzeComponent } from './expenses-and-incomes/expenses-and-incomes.component';
import { ForecastAnalyzeComponent } from './forecast/forecast.component';
import { AnalyzeComponent } from './analyze.component';
import { ProductsAnalyzeComponent } from './products/products.component';
import { IndicatorsComponent } from './expenses-and-incomes/indicators/indicators.component';
import { CategoriesComponent } from './shared/charts/categories/categories.component';
import { RecordType } from '@core/interfaces';
import { UsersComponent } from './shared/charts/users/users.component';
import { PlanningComponent } from './planning/planning.component';
import { PlanningCategoriesComponent } from './planning/categories/categories.component';
import { PlanningCurrencyRateComponent } from './planning/currency-rate/currency-rate.component';

const routes: Routes = [
    {
        path: '', component: AnalyzeComponent, children: [
            {
                path: 'expenses-and-incomes',
                component: ExpensesAndIncomesAnalyzeComponent,
                children: [
                    { path: 'indicators', component: IndicatorsComponent },
                    { path: 'categories/:type', component: CategoriesComponent },
                    { path: 'users', component: UsersComponent },
                    { path: '**', redirectTo: 'indicators', pathMatch: 'full' }
                ]
            },
            {
                path: 'planning',
                component: PlanningComponent,
                children: [
                    { path: 'currency-rate', component: PlanningCurrencyRateComponent, data: { periodHidden: true } },
                    { path: 'categories', component: PlanningCategoriesComponent, data: { periodHidden: true } },
                    { path: '**', redirectTo: 'currency-rate', pathMatch: 'full' }
                ]
            },
            {
                path: 'products',
                component: ProductsAnalyzeComponent,
                children: [
                    { path: 'categories/:type', component: CategoriesComponent, data: { products: true } },
                    { path: 'users', component: UsersComponent, data: { products: true } },
                    { path: '**', redirectTo: `categories/${RecordType.expense}`, pathMatch: 'full' }
                ]
            },
            { path: 'forecast', component: ForecastAnalyzeComponent, data: { periodHidden: true } },
            { path: '**', redirectTo: 'expenses-and-incomes', pathMatch: 'full' }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AnalyzeRoutingModule { }
