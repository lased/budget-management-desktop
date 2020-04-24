import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { LazyLoadEvent } from 'primeng/api';
import { Order, Op } from 'sequelize';
import * as Chart from 'chart.js';

import { Helpers } from '@core/helpers.class';
import { RecordType } from '@core/interfaces';
import { TableColumn } from '@shared/components/table/table.interface';

import { Record } from '@core/models/record';
import { Category } from '@core/models/category';
import { User } from '@core/models/user';

@Component({
  selector: 'app-expenses-and-incomes-analyze',
  templateUrl: './expenses-and-incomes.component.html',
  styleUrls: ['./expenses-and-incomes.component.scss']
})
export class ExpensesAndIncomesAnalyzeComponent implements OnInit {
  helpers = Helpers;
  balance: number;
  periodControl: FormControl;
  pieChart: Chart;

  records: Record[];
  recordColumns: TableColumn[];
  totalRecords: number;
  event: LazyLoadEvent;
  loading: boolean;

  constructor() { }

  ngOnInit() {
    const currentDate = new Date();
    const previousDate = new Date();

    previousDate.setMonth(currentDate.getMonth() - 1)

    this.periodControl = new FormControl([previousDate, currentDate]);
    this.recordColumns = [
      { field: 'type', header: 'Тип', span: .6, format: type => type === RecordType.income ? 'Доход' : 'Расход' },
      { field: 'category.name', header: 'Категория' },
      { field: 'subcategory.name', header: 'Подкатегория' },
      { field: 'user.name', header: 'Пользователь' },
      { field: 'date', header: 'Дата', format: date => Helpers.formatDate(date) },
      { field: 'amount', header: 'Сумма', format: amount => Helpers.formatCurrency(amount) },
      { field: 'note', header: 'Примечание', sortable: false }
    ];
    this.loading = true;
  }

  onLazyLoad(event: LazyLoadEvent) {
    this.event = event;
    this.getRecords(event);
  }

  selectedPeriod() {
    this.getRecords(this.event);
  }

  getRecords(event: LazyLoadEvent) {
    const include = [
      { model: Category, as: 'category' },
      { model: Category, as: 'subcategory' },
      { model: User, as: 'user' }
    ];
    const [prevDate, nextDate] = this.periodControl.value as Date[];
    const fromDate = this.helpers.formatDate(prevDate, 'yyyy-MM-dd');
    let order: Order = [['date', 'DESC']];
    let dateFilter = { [Op.gte]: fromDate };

    if (event.sortField) {
      const field = event.sortField.split('.');
      const sortOrder = event.sortOrder === 1 ? 'ASC' : 'DESC';

      order = field.length > 1
        ? [[include.find(i => i.as === field[0]), field[1], sortOrder]]
        : [[field[0], sortOrder]];
    }

    if (nextDate) {
      dateFilter[Op.lte] = this.helpers.formatDate(nextDate, 'yyyy-MM-dd') + ' 23:59';
    }

    this.loading = true;
    setTimeout(() => {
      Record.findAndCountAll({
        include,
        order,
        limit: event.rows,
        offset: event.first,
        where: { date: dateFilter }
      }).then(({ rows, count }) => {
        this.totalRecords = count;
        this.records = rows;
        this.loading = false;
        this.pieChart = this.getPieChart();
      });
    }, 500);
  }

  getPieChart(): Chart {
    const fn = (type) => this.records.filter(val => val.type === type).reduce((acc, val) => acc + val.amount, 0);
    const income = fn(RecordType.income);
    const expense = fn(RecordType.expense);

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
}
