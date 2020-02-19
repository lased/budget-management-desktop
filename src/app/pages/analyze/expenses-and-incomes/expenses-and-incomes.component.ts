import { Component, OnInit } from '@angular/core';
import * as Chart from 'chart.js';

import { Helpers } from 'src/app/core/helpers.class';
import { RecordType } from 'src/app/core/interfaces';
import { TableColumn } from 'src/app/shared/components/table/table.interface';

import { Record } from 'src/app/core/models/record';
import { Category } from 'src/app/core/models/category';
import { User } from 'src/app/core/models/user';

@Component({
  selector: 'app-expenses-and-incomes-analyze',
  templateUrl: './expenses-and-incomes.component.html',
  styleUrls: ['./expenses-and-incomes.component.scss']
})
export class ExpensesAndIncomesAnalyzeComponent implements OnInit {
  helpers = Helpers;
  records$: Promise<Record[]>;
  balance: number;
  recordColumns: TableColumn[];

  pieChart$: Promise<any>;

  constructor() { }

  ngOnInit() {
    this.pieChart$ = this.getPieChart();
    this.recordColumns = [
      { field: 'type', header: 'Тип', format: type => type === RecordType.income ? 'Доход' : 'Расход' },
      { field: 'category.name', header: 'Категория' },
      { field: 'subcategory.name', header: 'Подкатегория' },
      { field: 'user.name', header: 'Пользователь' },
      { field: 'date', header: 'Дата', format: date => Helpers.formatDate(date) },
      { field: 'amount', header: 'Сумма', format: amount => Helpers.formatCurrency(amount) },
      { field: 'note', header: 'Примечание' }
    ];
    this.records$ = this.getRecords();
  }

  getRecords(): Promise<Record[]> {
    return Record.findAll({
      include: [
        { model: Category, as: 'category' },
        { model: Category, as: 'subcategory' },
        { model: User, as: 'user' }
      ],
      order: [['date', 'DESC']]
    });
  }

  async getPieChart(): Promise<Chart> {
    const self = this;
    const [income, expense] = await Promise.all([
      Record.sum('amount', { where: { type: RecordType.income } }),
      Record.sum('amount', { where: { type: RecordType.expense } })
    ]);

    self.balance = income - expense;

    return {
      data: {
        labels: ['Доходы', 'Расходы'],
        datasets: [
          {
            data: [income, expense],
            backgroundColor: [
              '#34A835',
              '#e91224'
            ]
          }
        ],
      },
      options: {
        tooltips: {
          callbacks: {
            label: (tooltipItem, data) => {
              const value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];

              return Helpers.formatCurrency(+value);
            }
          }
        }
      }
    } as Chart;
  }
}
