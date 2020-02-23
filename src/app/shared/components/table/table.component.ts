import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SortMeta } from 'primeng/api';

import { TableColumn } from './table.interface';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent {
  @Input() columns: TableColumn[];
  @Input() value: any[];

  @Output() sort = new EventEmitter<SortMeta>();

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

  onSort(event: SortMeta) {
    this.sort.emit(event);
  }

}
