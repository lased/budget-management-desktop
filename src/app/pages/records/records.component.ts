import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LazyLoadEvent } from 'primeng/api';
import { Order } from 'sequelize/types';

import { Record } from '@app/core/models/record';
import { Category } from '@app/core/models/category';
import { User } from '@app/core/models/user';
import { Helpers } from '@app/core/helpers.class';
import { TableColumn } from '@shared/components/table/table.interface';
import { RecordType } from '@app/core/interfaces';

@Component({
  selector: 'app-records',
  templateUrl: './records.component.html',
  styleUrls: ['./records.component.scss']
})
export class RecordsComponent implements OnInit {
  loading = false;
  helpers = Helpers;

  records: Record[];
  recordColumns: TableColumn[];
  totalRecords: number;
  event: LazyLoadEvent;

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
    this.recordColumns = [
      { field: 'type', header: 'Тип', span: .6, format: type => type === RecordType.income ? 'Доход' : 'Расход' },
      { field: 'category.name', header: 'Категория' },
      { field: 'subcategory.name', header: 'Подкатегория' },
      { field: 'user.name', header: 'Пользователь' },
      { field: 'date', header: 'Дата', format: date => this.helpers.formatDate(date) },
      { field: 'amount', header: 'Сумма', format: amount => this.helpers.formatCurrency(amount) },
      { field: 'note', header: 'Примечание', sortable: false }
    ];
    this.loading = true;
  }

  onLazyLoad(event: LazyLoadEvent) {
    this.event = event;
    this.getRecords(event);
  }

  getRecords(event: LazyLoadEvent) {
    const include = [
      { model: Category, as: 'category' },
      { model: Category, as: 'subcategory' },
      { model: User, as: 'user' }
    ];
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
      offset: event.first
    }).then(({ rows, count }) => {
      this.totalRecords = count;
      this.records = rows;
      this.loading = false;
    });
  }

  getTypeName(type: RecordType): string {
    return type === RecordType.expense
      ? 'Расход'
      : 'Доход';
  }

  createOrUpdate(id?: number) {
    const url = id
      ? ['/pages/records/update', id]
      : ['/pages/records/create'];

    this.router.navigate(url);
  }

  delete(id: number) {
    Record.destroy({ where: { id } }).then(_ => this.getRecords(this.event));
  }

}
