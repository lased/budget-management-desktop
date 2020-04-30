import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { RecordType, AppChart } from '@core/interfaces';
import { AnalyzeService, DateFilter } from '@pages/analyze/analyze.service';
import { switchMap } from 'rxjs/operators';
import { Helpers } from '@core/helpers.class';
import { FilterMetadata } from 'primeng/api';

@Component({
  selector: 'app-categories-analyze',
  templateUrl: './categories.component.html'
})
export class CategoriesComponent implements OnInit, OnDestroy {
  loading = true;
  helpers = Helpers;
  type: RecordType;

  categoryChart: AppChart = {};
  subcategoryChart: AppChart = {};

  subscription: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
    private analyzeService: AnalyzeService
  ) { }

  ngOnInit() {
    this.categoryChart = this.getCategoryChartData();
    this.subcategoryChart = this.getCategoryChartData(true);
    this.subscription = this.activatedRoute.params.pipe(
      switchMap(params => {
        this.type = params.type;
        this.analyzeService.setFilters({});

        return this.analyzeService.getPeriod();
      })
    ).subscribe(period => {
      this.loading = true;
      this.getCharts(period).then(_ => this.loading = false);
    });
  }

  getCategoryChartData(child = false): AppChart {
    return {
      chart: { type: 'pie', events: { dataPointSelection: this.dataPointSelection.bind(this, child) } },
      title: { text: child ? 'Подкатегории' : 'Категории', align: 'center' },
      legend: { position: 'right' },
      tooltip: { y: { formatter: val => this.helpers.formatCurrency(val) } }
    };
  }

  dataPointSelection(child, _, __, config) {
    const arrIndexes: number[] = config.selectedDataPoints[0];
    const key = child ? 'subcategory.name' : 'category.name';
    const filters: { [s: string]: FilterMetadata } = {
      [key]: { value: null }
    };

    if (arrIndexes.length) {
      filters[key] = {
        value: config.w.config.labels[arrIndexes[0]]
      };
    }

    this.analyzeService.setFilters(filters);
  }

  async getCharts(period: DateFilter) {
    const [recCategories, recSubcategories] = await Promise.all([
      this.analyzeService.getSumGroupCategory(this.type, period, false),
      this.analyzeService.getSumGroupCategory(this.type, period, false, true),
    ]);

    this.categoryChart.labels = recCategories.map(r => r.category.name);
    this.categoryChart.series = recCategories.map(r => r.amount);
    this.subcategoryChart.labels = recSubcategories.map(r => r.subcategory.name);
    this.subcategoryChart.series = recSubcategories.map(r => r.amount);

  }

  ngOnDestroy() {
    this.analyzeService.setFilters({});
    this.subscription.unsubscribe();
  }
}
