import { NgModule } from '@angular/core';

import { AnalyzeRoutingModule } from './analyze-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';

import { AnalyzeComponent } from './analyze.component';
import { ExpensesAndIncomesAnalyzeComponent } from './expenses-and-incomes/expenses-and-incomes.component';
import { ForecastAnalyzeComponent } from './forecast/forecast.component';
import { ProductsAnalyzeComponent } from './products/products.component';
import { IndicatorsComponent } from './expenses-and-incomes/indicators/indicators.component';
import { CategoriesComponent } from './categories/categories.component';
import { AnalyzeTableComponent } from './table/table.component';

@NgModule({
  declarations: [
    AnalyzeComponent,
    ExpensesAndIncomesAnalyzeComponent,
    ForecastAnalyzeComponent,
    ProductsAnalyzeComponent,
    IndicatorsComponent,
    CategoriesComponent,
    AnalyzeTableComponent
  ],
  imports: [
    SharedModule,
    AnalyzeRoutingModule
  ]
})
export class AnalyzeModule { }
