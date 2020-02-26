import { Component, Input, Output, EventEmitter, ContentChild, TemplateRef, OnInit } from '@angular/core';
import { SortMeta, LazyLoadEvent } from 'primeng/api';

import { TableColumn } from './table.interface';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent {
  private _totalRecords: number;

  @Input() rows = 20;
  @Input() rowsPerPageOptions = [10, 20, 50];
  @Input() lazy = false;
  @Input() loading = false;
  @Input() columns: TableColumn[];
  @Input() value: any[];
  @Input()
  get totalRecords() {
    return this._totalRecords;
  }
  set totalRecords(value: number) {
    this._totalRecords = value && typeof value === 'number' && value >= 0
      ? value
      : this.value
        ? this.value.length
        : 0;
  }

  @Output() sort = new EventEmitter<SortMeta>();
  @Output() lazyLoad = new EventEmitter<LazyLoadEvent>();

  @ContentChild('actionsHeader') actionsHeader: TemplateRef<any>;
  @ContentChild('actionsBody') actionsBody: TemplateRef<any>;
  @ContentChild('actionsCol') actionsCol: TemplateRef<any>;

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

}
