import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FilterMetadata } from 'primeng/api';
import { Subscription } from 'rxjs';
import { Op, Sequelize, IncludeOptions, Includeable } from 'sequelize';

import { AnalyzeService, DateFilter } from '@core/services/analyze.service';
import { AppChart } from '@core/interfaces';
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

  userChart: AppChart = {};

  subscription: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
    private analyzeService: AnalyzeService
  ) { }

  ngOnInit() {
    this.products = this.activatedRoute.snapshot.data.products || false;
    this.userChart = this.getUserChart();
    this.subscription = this.analyzeService.getPeriod().subscribe(period => {
      this.loading = true;
      this.getUserChartData(period).then(_ => this.loading = false);
    })
  }

  getUserChart(): AppChart {
    return {
      chart: { type: 'pie', events: { dataPointSelection: this.dataPointSelection.bind(this) } },
      title: { text: 'Пользователи', align: 'center' },
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

    if (this.products) {
      include.push({ model: Product, as: 'products' });
    }

    const records = await Record.findAll({
      include,
      attributes: [[Sequelize.literal(`SUM(${this.products ? 'products.amount' : 'amount'})`), 'amount']],
      where: { date: dateQuery },
      group: ['userId']
    }) as Record[];

    this.userChart.labels = records.map(r => r.user.name);
    this.userChart.series = records.map(r => r.amount);
  }

  dataPointSelection(_, __, config) {
    const arrIndexes: number[] = config.selectedDataPoints[0];
    const filters: { [s: string]: FilterMetadata } = {
      'user.name': { value: null }
    };

    if (arrIndexes.length) {
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
