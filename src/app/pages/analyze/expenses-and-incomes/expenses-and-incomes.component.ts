import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { LazyLoadEvent, MenuItem, FilterMetadata } from 'primeng/api';
import { Order, Op } from 'sequelize';
import { Subscription } from 'rxjs';

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
export class ExpensesAndIncomesAnalyzeComponent implements OnInit, OnDestroy {
  helpers = Helpers;
  filters: { [s: string]: FilterMetadata } = {};
  period: DateFilter;
  charts: MenuItem[];

  records: Record[];
  recordColumns: TableColumn[];
  totalRecords: number;
  actionsCallback: TableActions;
  event: LazyLoadEvent;
  loading: boolean;

  periodSubscription: Subscription;
  filtersSubscription: Subscription;

  constructor(
    private router: Router,
    private analyzeService: AnalyzeService
  ) { }

  ngOnInit() {
    this.loading = true;
    this.charts = [
      { label: 'Индикаторы', icon: '', routerLink: ['indicators'] },
      { label: 'Категории доходов', icon: '', routerLink: ['categories', RecordType.income] },
      { label: 'Категории расходов', icon: '', routerLink: ['categories', RecordType.expense] }
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
    this.periodSubscription = this.analyzeService.getPeriod().subscribe(period => {
      this.period = period;

      if (this.event) {
        this.getRecords(this.event);
      }
    });
    this.filtersSubscription = this.analyzeService.getFilters().subscribe(filters => {
      if (!Object.keys(filters).length) {
        this.filters = {};

        return;
      }

      this.filters = { ...this.filters, ...filters };
      this.getRecords(this.event);
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
    const date = {
      [Op.gte]: this.period.min,
      [Op.lte]: this.period.max
    };
    const filters = {};
    let order: Order = [['date', 'DESC']];

    if (event.sortField) {
      const field = event.sortField.split('.');
      const sortOrder = event.sortOrder === 1 ? 'ASC' : 'DESC';

      order = field.length > 1
        ? [[include.find(i => i.as === field[0]), field[1], sortOrder]]
        : [[field[0], sortOrder]];
    }

    if (Object.keys(this.filters).length) {
      Object.keys(this.filters).forEach(k => {
        const key = k.split('.').length > 1 ? `$${k}$` : k;

        if (this.filters[k].value === null) {
          delete filters[key];
        } else {
          filters[key] = { [Op.eq]: this.filters[k].value };
        }
      });
    }

    this.loading = true;
    Record.findAndCountAll({
      include,
      order,
      limit: event.rows,
      offset: event.first,
      where: { date, ...filters }
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
    Record.destroy({ where: { id } }).then(_ => {
      this.getRecords(this.event);
      this.analyzeService.setPeriod([this.period.min, this.period.max]);
    });
  }

  ngOnDestroy() {
    this.periodSubscription.unsubscribe();
    this.filtersSubscription.unsubscribe();
  }
}
