import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FilterMetadata, LazyLoadEvent } from 'primeng/api';
import { Op, Order, Model, FindAttributeOptions, Sequelize } from 'sequelize';
import { Subscription } from 'rxjs';

import { Record } from '@core/models/record';
import { TableColumn, TableActions } from '@shared/components/table/table.interface';
import { DateFilter, AnalyzeService } from '@core/services/analyze.service';

export interface AppIncludeModel {
  model: typeof Model;
  as: string;
  required?: boolean;
  attributes?: FindAttributeOptions;
}

@Component({
  selector: 'app-analyze-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class AnalyzeTableComponent implements OnInit, OnDestroy {
  @Input() columns: TableColumn[] = [];
  @Input() include: AppIncludeModel[] = [];
  @Input() actionsCallback: TableActions = {};
  @Input() formatedOutput: <T>(data: { count: number, rows: Record[] }) => { count: number, rows: T[] };

  filters: { [s: string]: FilterMetadata } = {};
  period: DateFilter;

  records: Record[];
  totalRecords: number;
  event: LazyLoadEvent;
  loading: boolean;

  periodSubscription: Subscription;
  filtersSubscription: Subscription;

  constructor(
    private analyzeService: AnalyzeService
  ) { }

  ngOnInit() {
    this.loading = true;
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

    if (this.actionsCallback.onDelete) {
      const userFn = this.actionsCallback.onDelete;

      this.actionsCallback.onDelete = (rec: Record) => {
        const resUserFn: any = userFn(rec);

        if (resUserFn instanceof Promise) {
          resUserFn.then(data => {
            this.deleteEvent();

            return data;
          });
        } else {
          this.deleteEvent();
        }
      };
    }
  }

  onLazyLoad(event: LazyLoadEvent) {
    this.event = event;
    this.getRecords(event);
  }

  getRecords(event: LazyLoadEvent = {}) {
    const date = {
      [Op.gte]: this.period.min,
      [Op.lte]: this.period.max
    };
    const filters = {};
    let include = [...this.include];
    let order: Order = [['date', 'DESC']];

    if (event.sortField) {
      const field = event.sortField.split('.');
      const sortOrder = event.sortOrder === 1 ? 'ASC' : 'DESC';

      order = field.length > 1
        ? [[this.include.find(i => i.as === field[0]), field[1], sortOrder]]
        : [[field[0], sortOrder]];
    }

    if (Object.keys(this.filters).length) {
      Object.keys(this.filters).forEach(k => {
        const field = k.split('.');

        if (field.length > 1) {
          include = include.map(
            i => i.as === field[0] && this.filters[k].value !== null
              ? { ...i, where: { [field[1]]: this.filters[k].value } }
              : i
          );
        } else {
          if (this.filters[k].value === null) {
            delete filters[field[0]];
          } else {
            filters[field[0]] = { [Op.eq]: this.filters[k].value };
          }
        }
      });
    }

    this.loading = true;
    Record.findAndCountAll({
      order,
      include,
      limit: event.rows,
      offset: event.first,
      where: { date, ...filters }
    })
      .then(data => this.formatedOutput ? this.formatedOutput(data) : data)
      .then(({ rows, count }) => {
        this.totalRecords = count;
        this.records = rows;
        this.loading = false;
      });
  }

  isActions() {
    return !!Object.keys(this.actionsCallback).length;
  }

  deleteEvent() {
    this.getRecords(this.event);
    this.analyzeService.setPeriod([this.period.min, this.period.max]);
  }

  ngOnDestroy() {
    this.periodSubscription.unsubscribe();
    this.filtersSubscription.unsubscribe();
  }

}
