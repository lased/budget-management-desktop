import { NgModule } from '@angular/core';

import { AnalyzeRoutingModule } from './analyze-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';

import { AnalyzeComponent } from './analyze.component';
import { ExpensesAndIncomesAnalyzeComponent } from './expenses-and-incomes/expenses-and-incomes.component';
import { ForecastAnalyzeComponent } from './forecast/forecast.component';
import { ProductsAnalyzeComponent } from './products/products.component';
import { IndicatorsComponent } from './expenses-and-incomes/indicators/indicators.component';

import { CategoriesComponent } from './shared/charts/categories/categories.component';
import { AnalyzeTableComponent } from './shared/charts/table/table.component';
import { UsersComponent } from './shared/charts/users/users.component';
import { PlanningComponent } from './planning/planning.component';
import { PlanningManageComponent } from './planning/manage/manage.component';
import { PlanningIndicatorsComponent } from './planning/indicators/indicators.component';
import { PlanningCategoriesComponent } from './planning/categories/categories.component';

@NgModule({
  declarations: [
    AnalyzeComponent,
    ExpensesAndIncomesAnalyzeComponent,
    ForecastAnalyzeComponent,
    ProductsAnalyzeComponent,
    IndicatorsComponent,
    CategoriesComponent,
    AnalyzeTableComponent,
    UsersComponent,
    PlanningComponent,
    PlanningManageComponent,
    PlanningIndicatorsComponent,
    PlanningCategoriesComponent
  ],
  imports: [
    SharedModule,
    AnalyzeRoutingModule
  ],
  entryComponents: [PlanningManageComponent]
})
export class AnalyzeModule { }
