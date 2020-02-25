import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { RecordType } from 'src/app/core/interfaces';

import { Record } from 'src/app/core/models/record';
import { Category } from 'src/app/core/models/category';
import { User } from 'src/app/core/models/user';
import { Helpers } from 'src/app/core/helpers.class';
import { TableColumn } from 'src/app/shared/components/table/table.interface';

@Component({
  selector: 'app-records',
  templateUrl: './records.component.html',
  styleUrls: ['./records.component.scss']
})
export class RecordsComponent implements OnInit {
  records$: Promise<Record[]>;
  recordColumns: TableColumn[];

  helpers = Helpers;

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
    this.getRecords();
  }

  getRecords() {
    this.records$ = null;
    this.records$ = Record.findAll({
      include: [
        { model: Category, as: 'category' },
        { model: Category, as: 'subcategory' },
        { model: User, as: 'user' }
      ],
      order: [['date', 'DESC']]
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
    Record.destroy({ where: { id } }).then(_ => this.getRecords());
  }

}
