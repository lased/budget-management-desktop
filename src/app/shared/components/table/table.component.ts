import { Component, OnInit, Input } from '@angular/core';

import { TableColumn } from './table.interface';
import { SortEvent } from 'primeng/api';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {
  @Input() columns: TableColumn[];
  @Input() value: any[];

  constructor() { }

  ngOnInit() {
  }

  getRowData(row: any, field: string) {
    const arr = field.split('.');

    if (arr.length) {
      let result = row;

      try {
        arr.forEach(val => {
          result = result[val];
        });
      } catch (err) {
        result = '';
      }

      return result;
    }

    return row[field as string] || '';
  }

  customSort(event: SortEvent) {
    event.data.sort((data1, data2) => {
      const value1 = this.getRowData(data1, event.field);
      const value2 = this.getRowData(data2, event.field);
      let result = null;

      if (value1 == null && value2 != null) {
        result = -1;
      } else if (value1 != null && value2 == null) {
        result = 1;
      } else if (value1 == null && value2 == null) {
        result = 0;
      } else if (typeof value1 === 'string' && typeof value2 === 'string') {
        result = value1.localeCompare(value2);
      } else {
        result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;
      }

      return (event.order * result);
    });
  }

}
