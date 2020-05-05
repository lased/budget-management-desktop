import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SortMeta, LazyLoadEvent } from 'primeng/api';

import { TableColumn, TableActions } from './table.interface';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent {
  @Input() tree = false;
  @Input() treeTogglerIndex = 0; 
  @Input() actions = true;
  @Input() actionsSpan = 1;
  @Input() actionsCallback: TableActions = {};
  @Input() rows = 20;
  @Input() rowsPerPageOptions = [10, 20, 50];
  @Input() lazy = false;
  @Input() loading = false;
  @Input() columns: TableColumn[] = [];
  @Input() value: any[] = [];
  @Input() totalRecords = this.value.length;

  @Output() sort = new EventEmitter<SortMeta>();
  @Output() lazyLoad = new EventEmitter<LazyLoadEvent>();

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

  onLazyLoad(event: LazyLoadEvent) {
    this.lazyLoad.emit(event);
  }

  checkFunction(fun: any) {
    return fun && typeof fun === 'function';
  }
}
