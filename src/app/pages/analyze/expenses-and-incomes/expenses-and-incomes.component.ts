import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LazyLoadEvent } from 'primeng/api';
import { Order, Op } from 'sequelize';
import * as Chart from 'chart.js';

import { Helpers } from '@core/helpers.class';
import { RecordType } from '@core/interfaces';
import { TableColumn, TableActions } from '@shared/components/table/table.interface';

import { Record } from '@core/models/record';
import { Category } from '@core/models/category';
import { User } from '@core/models/user';
import { AnalyzeService, DateFilter } from '../analyze.service';

@Component({
  selector: 'app-expenses-and-incomes-analyze',
  templateUrl: './expenses-and-incomes.component.html',
  styleUrls: ['./expenses-and-incomes.component.scss']
})
export class ExpensesAndIncomesAnalyzeComponent implements OnInit {
  helpers = Helpers;
  balance: number;
  pieChart$: Promise<Chart>;
  period: DateFilter;

  records: Record[];
  recordColumns: TableColumn[];
  totalRecords: number;
  actionsCallback: TableActions;
  event: LazyLoadEvent;
  loading: boolean;

  constructor(
    private router: Router,
    private analyzeService: AnalyzeService
  ) { }

  ngOnInit() {
    this.loading = true;
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
    this.analyzeService.getPeriod().subscribe(period => {
      this.period = period;
      this.pieChart$ = this.getPieChart(period);

      if (this.event) {
        this.getRecords(this.event);
      }
    });
  }

  onLazyLoad(event: LazyLoadEvent) {
    this.event = event;
    this.getRecords(event);
  }

  getRecords(event: LazyLoadEvent = {}) {
    const include = [
      { model: Category, as: 'category' },
      { model: Category, as: 'subcategory' },
      { model: User, as: 'user' }
    ];
    const date = this.getQueryDateFilter(this.period);
    let order: Order = [['date', 'DESC']];

    if (event.sortField) {
      const field = event.sortField.split('.');
      const sortOrder = event.sortOrder === 1 ? 'ASC' : 'DESC';

      order = field.length > 1
        ? [[include.find(i => i.as === field[0]), field[1], sortOrder]]
        : [[field[0], sortOrder]];
    }

    this.loading = true;
    Record.findAndCountAll({
      include,
      order,
      limit: event.rows,
      offset: event.first,
      where: { date }
    }).then(({ rows, count }) => {
      this.totalRecords = count;
      this.records = rows;
      this.loading = false;
    });
  }

  create() {
    this.router.navigate(['/pages/records/create']);
  }

  update(id: number) {
    this.router.navigate(['/pages/records/update', id]);
  }

  delete(id: number) {
    Record.destroy({ where: { id } }).then(_ => this.getRecords(this.event));
  }

  async getPieChart(dateFilter: DateFilter): Promise<Chart> {
    const date = this.getQueryDateFilter(dateFilter);
    const [income, expense] = await Promise.all([
      Record.sum('amount', { where: { type: RecordType.income, date } }),
      Record.sum('amount', { where: { type: RecordType.expense, date } })
    ]);

    this.balance = income - expense;

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

  private getQueryDateFilter(period: DateFilter) {
    return {
      [Op.gte]: period.min,
      [Op.lte]: period.max
    };
  }
}
