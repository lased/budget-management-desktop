import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FilterMetadata } from 'primeng/api';
import { Subscription } from 'rxjs';
import { Op, Sequelize, IncludeOptions, Includeable } from 'sequelize';

import { AnalyzeService, DateFilter } from '@core/services/analyze.service';
import { AppChart, RecordType } from '@core/interfaces';
import { Helpers } from '@core/helpers.class';
import { User } from '@core/models/user';
import { Record } from '@core/models/record';
import { Product } from '@core/models/product';

@Component({
  selector: 'app-analyze-users',
  templateUrl: './users.component.html'
})
export class UsersComponent implements OnInit, OnDestroy {
  loading = true;
  products: boolean;

  userChartIncomes: AppChart = {};
  userChartExpenses: AppChart = {};

  subscription: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
    private analyzeService: AnalyzeService
  ) { }

  ngOnInit() {
    this.products = this.activatedRoute.snapshot.data.products || false;
    this.userChartIncomes = this.getUserChart(RecordType.income);
    this.userChartExpenses = this.getUserChart(RecordType.expense);
    this.subscription = this.analyzeService.getPeriod().subscribe(period => {
      this.loading = true;
      this.getUserChartData(period).then(_ => this.loading = false);
    });
  }

  getUserChart(type: RecordType): AppChart {
    const typeText = type === RecordType.income ? 'доход' : 'расход';

    return {
      chart: { type: 'pie', events: { dataPointSelection: this.dataPointSelection.bind(this, type) } },
      title: { text: `Пользователи (${typeText})`, align: 'center' },
      legend: { position: 'top' },
      tooltip: { y: { formatter: val => Helpers.formatCurrency(val) } }
    };
  }

  async getUserChartData(period: DateFilter) {
    const dateQuery = {
      [Op.gte]: period.min,
      [Op.lte]: period.max
    };
    const include: Includeable[] = [{ model: User, as: 'user' }];
    let field = 'amount';
    let group = ['type', 'userId'];
    let having = { [field]: { [Op.not]: null } };

    if (this.products) {
      field = 'products.amount';
      group = ['userId'];
      having = {};
      include.push({ model: Product, as: 'products' });
    }

    const records = await Record.findAll({
      include,
      group,
      having,
      attributes: [
        'type',
        [Sequelize.literal(`SUM(${field})`), 'amount']
      ],
      where: { date: dateQuery }
    }) as Record[];

    if (this.products) {
      this.setUserChartLabelsAndSeries(this.userChartExpenses, records.filter(r => r.amount > 0));
    } else {
      this.setUserChartLabelsAndSeries(this.userChartIncomes, records.filter(r => r.type === RecordType.income));
      this.setUserChartLabelsAndSeries(this.userChartExpenses, records.filter(r => r.type === RecordType.expense));

    }
  }

  setUserChartLabelsAndSeries(chart: AppChart, records: Record[]) {
    chart.labels = records.map(r => r.user.name);
    chart.series = records.map(r => r.amount);
  }

  dataPointSelection(type, _, __, config) {
    const arrIndexes: number[] = config.selectedDataPoints[0];
    const filters: { [s: string]: FilterMetadata } = {
      type: { value: null },
      'user.name': { value: null }
    };

    if (arrIndexes.length) {
      filters.type = { value: type }
      filters['user.name'] = {
        value: config.w.config.labels[arrIndexes[0]]
      };
    }

    this.analyzeService.setFilters(filters);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
