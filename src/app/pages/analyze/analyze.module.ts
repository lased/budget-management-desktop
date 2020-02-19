import { NgModule } from '@angular/core';

import { AnalyzeRoutingModule } from './analyze-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';

import { AnalyzeComponent } from './analyze.component';
import { ExpensesAndIncomesAnalyzeComponent } from './expenses-and-incomes/expenses-and-incomes.component';
import { CategoriesAnalyzeComponent } from './categories/categories.component';
import { ForecastAnalyzeComponent } from './forecast/forecast.component';
import { ProductsAnalyzeComponent } from './products/products.component';

@NgModule({
  declarations: [
    AnalyzeComponent,
    ExpensesAndIncomesAnalyzeComponent,
    CategoriesAnalyzeComponent,
    ForecastAnalyzeComponent,
    ProductsAnalyzeComponent
  ],
  imports: [
    SharedModule,
    AnalyzeRoutingModule
  ]
})
export class AnalyzeModule { }
