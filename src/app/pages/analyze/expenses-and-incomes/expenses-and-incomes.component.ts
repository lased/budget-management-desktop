import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';

import { Helpers } from '@core/helpers.class';
import { RecordType } from '@core/interfaces';
import { TableColumn, TableActions } from '@shared/components/table/table.interface';

import { Record } from '@core/models/record';
import { Category } from '@core/models/category';
import { User } from '@core/models/user';
import { AppIncludeModel } from '../table/table.component';

@Component({
  selector: 'app-expenses-and-incomes-analyze',
  templateUrl: './expenses-and-incomes.component.html'
})
export class ExpensesAndIncomesAnalyzeComponent implements OnInit {
  charts: MenuItem[];
  recordColumns: TableColumn[];
  actionsCallback: TableActions;
  include: AppIncludeModel[];

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
    this.charts = [
      { label: 'Индикаторы', icon: '', routerLink: ['indicators'] },
      { label: 'Категории доходов', icon: '', routerLink: ['categories', RecordType.income] },
      { label: 'Категории расходов', icon: '', routerLink: ['categories', RecordType.expense] }
    ];
    this.include = [
      { model: Category, as: 'category' },
      { model: Category, as: 'subcategory' },
      { model: User, as: 'user' },
    ];
    this.actionsCallback = {
      onCreate: () => this.create(),
      onDelete: (record: Record) => this.delete(record.id),
      onUpdate: (record: Record) => this.update(record.id)
    };
    this.recordColumns = [
      { field: 'type', header: 'Тип', span: .6, format: type => type === RecordType.income ? 'Доход' : 'Расход' },
      { field: 'category.name', header: 'Категория' },
      { field: 'subcategory.name', header: 'Подкатегория' },
      { field: 'user.name', header: 'Пользователь' },
      { field: 'date', header: 'Дата', format: date => Helpers.formatDate(date) },
      { field: 'amount', header: 'Сумма', format: amount => Helpers.formatCurrency(amount) },
      { field: 'note', header: 'Примечание', sortable: false }
    ];
  }

  create() {
    this.router.navigate(['/pages/records/create']);
  }

  update(id: number) {
    this.router.navigate(['/pages/records/update', id]);
  }

  async delete(id: number) {
    await Record.destroy({ where: { id } });
  }
}
