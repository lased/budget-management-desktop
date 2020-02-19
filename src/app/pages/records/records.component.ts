import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { RecordType } from 'src/app/core/interfaces';

import { Record } from 'src/app/core/models/record';
import { Category } from 'src/app/core/models/category';
import { User } from 'src/app/core/models/user';


@Component({
  selector: 'app-records',
  templateUrl: './records.component.html',
  styleUrls: ['./records.component.scss']
})
export class RecordsComponent implements OnInit {
  records$: Promise<Record[]>;
  pieChart: any;

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
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
