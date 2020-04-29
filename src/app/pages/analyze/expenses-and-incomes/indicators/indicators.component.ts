import { Component, OnInit, OnDestroy } from '@angular/core';
import { Op } from 'sequelize';

import { Record } from '@core/models/record';
import { RecordType, AppChart } from '@core/interfaces';
import { Helpers } from '@core/helpers.class';
import { DateFilter, AnalyzeService } from '@pages/analyze/analyze.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-indicators',
  templateUrl: './indicators.component.html',
  styleUrls: ['./indicators.component.scss']
})
export class IndicatorsComponent implements OnInit, OnDestroy {
  loading = true;
  helpers = Helpers;

  pieChart: AppChart = {};
  balanceChart: AppChart = {};

  subscription: Subscription;

  constructor(
    private analyzeService: AnalyzeService
  ) { }

  ngOnInit() {
    this.initPieChart();
    this.getBalanceChart(0);
    this.subscription = this.analyzeService.getPeriod().subscribe(period => {
      this.loading = true;
      this.getPieChart(period).then(_ => this.loading = false);
    });
  }

  initPieChart() {
    this.pieChart = {
      chart: { type: 'pie', events: { dataPointSelection: this.dataPointSelection.bind(this) } },
      title: { text: 'Расходы и доходы', align: 'center' },
      legend: { position: 'top' },
      labels: ['Расходы', 'Доходы'],
      colors: ['#e74c3c', '#2ecc71'],
      tooltip: { y: { formatter: val => this.helpers.formatCurrency(val) } }
    };
  }

  dataPointSelection(event, chartContext, config) {
    console.log(config);

  }

  async getPieChart(period: DateFilter) {
    const dateQuery = {
      [Op.gte]: period.min,
      [Op.lte]: period.max
    };
    const [income, expense] = await Promise.all([
      Record.sum('amount', { where: { type: RecordType.income, date: dateQuery } }),
      Record.sum('amount', { where: { type: RecordType.expense, date: dateQuery } })
    ]);
    this.pieChart.series = [expense, income];
    this.getBalanceChart(income - expense);
  }

  getBalanceChart(balance = 0) {
    this.balanceChart = {
      series: [100],
      chart: { type: 'radialBar' },
      colors: [balance >= 0 ? '#2ecc71' : '#e74c3c'],
      plotOptions: {
        radialBar: {
          dataLabels: {
            name: {
              fontSize: '1.1rem',
            },
            value: {
              fontSize: '1.1rem',
              fontWeight: 700,
              color: 'rgba(0, 0, 0, 0.5)',
              formatter: _ => this.helpers.formatCurrency(balance)
            }
          }
        }
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          type: 'horizontal',
          gradientToColors: [balance > 0 ? '#27ae60' : '#c0392b'],
          stops: [0, 100]
        }
      },
      labels: ['Баланс']
    };
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}