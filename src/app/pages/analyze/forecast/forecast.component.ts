import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Sequelize } from 'sequelize';
import * as Chart from 'chart.js';

import { Helpers } from 'src/app/core/helpers.class';
import { MovingAverage, NeuralModel } from './algorithm.class';

import { RecordType } from 'src/app/core/interfaces';

import { Record } from 'src/app/core/models/record';

interface Period {
  name: string;
  value: number;
}

@Component({
  selector: 'app-forecast-analyze',
  templateUrl: './forecast.component.html'
})
export class ForecastAnalyzeComponent implements OnInit {
  lineChart$: Promise<Chart>;
  incomes: Record[];
  expenses: Record[];

  periodControl: FormControl;
  selectedPeriod: Period;
  periods: Period[];

  constructor() { }

  ngOnInit() {
    this.periodControl = new FormControl();
    this.periodControl.disable();
    this.periods = [
      { name: '1 месяц', value: 1 },
      { name: '3 месяца', value: 3 },
      { name: 'Пол года', value: 6 }
    ];
    this.lineChart$ = this.getLineChart().then(chart => {
      const datasets = chart.data.datasets;
      const expenses = datasets[0].data;

      if (expenses.length >= 4) {
        this.periodControl.enable();
      } else {
        this.periodControl.disable();
      }

      return chart;
    });
  }

  selectPeriod(chart: Chart) {
    const period = this.periodControl.value;
    const datasets = chart.data.datasets;

    if (this.selectedPeriod) {
      this.clearLineChart(chart, this.selectedPeriod);
    }

    const expenses = { data: datasets[0].data, forecast: { average: [], model: [] } };

    this.selectedPeriod = period;
    expenses.forecast = this.forecastDataset(expenses.data as number[], period.value);
    chart.data.labels = this.extendLabels(chart.data.labels as string[], period.value);
    this.pushDataset(chart, {
      type: 'line',
      label: 'Прогноз (скользящая средняя)',
      data: expenses.forecast.average,
      borderColor: 'yellow',
      backgroundColor: 'transparent'
    });
    this.pushDataset(chart, {
      type: 'line',
      label: 'Прогноз (нейронная сеть)',
      data: expenses.forecast.model,
      borderColor: 'blue',
      backgroundColor: 'transparent'
    });
    chart.data = { ...chart.data };
  }

  pushDataset(chart: Chart, dataset: Chart.ChartDataSets) {
    if (dataset.data.length) {
      chart.data.datasets.unshift(dataset);
    }
  }

  forecastDataset(dataset: number[], period: number) {
    const MA = new MovingAverage(dataset);
    const MAValues = MA.forecast(period);
    const averages = MA.averageArray();

    const net = new NeuralModel(dataset);
    const netValues = net.forecast(period);

    return { average: [...averages, ...MAValues], model: [...net.getModelData(), ...netValues] };
  }

  clearLineChart(chart: Chart, period: Period) {
    const labels = chart.data.labels;
    const datasets = chart.data.datasets;

    labels.splice(-period.value);
    datasets.splice(0, datasets.length - 1);
  }

  extendLabels(labels: string[], period: number) {
    const lbls = [...labels];
    for (let i = 0; i < period; i++) {
      const last = lbls[lbls.length - 1];
      const next = new Date(last);

      next.setMonth(next.getMonth() + 1);
      lbls.push(next.toDateString());
    }

    return lbls;
  }

  async getLineChart(): Promise<Chart> {
    const periodRecords = await this.getPeriodData();
    const labels = [...new Set(periodRecords.map(r => r.date.toDateString()))];
    const temp = {
      expenses: Array(labels.length).fill(0)
    };
    const expenses = periodRecords.filter(r => r.type === RecordType.expense);


    labels.forEach((l, i) => {
      const getIndex = r => r.date.toDateString() === l;
      const expenseIndex = expenses.findIndex(getIndex);

      if (expenseIndex !== -1) {
        temp.expenses[i] = expenses[expenseIndex].amount;
      }
    });

    return {
      data: {
        labels,
        datasets: [
          {
            label: 'Расходы',
            data: temp.expenses,
            borderColor: 'red',
            backgroundColor: 'transparent'
          }
        ]
      },
      options: {
        scales: {
          yAxes: [
            {
              display: true,
              ticks: {
                beginAtZero: true,
                callback: (value, i, values) => Helpers.formatCurrency(+value)
              }
            }
          ],
          xAxes: [
            {
              display: true,
              ticks: {
                callback: (value, i, values) => Helpers.formatDate(value, 'LLLL yyyy')
              }
            }
          ]
        },
        tooltips: {
          mode: 'label',
          callbacks: {
            label: (tooltipItem, data) => {
              const value = +data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
              const label = data.datasets[tooltipItem.datasetIndex].label;

              return `${label}: ${Helpers.formatCurrency(value)}`;
            }
          }
        }
      }
    } as Chart;
  }

  getPeriodData(): Promise<Record[]> {
    const dateFn = Sequelize.fn('datetime', Sequelize.col('date'), 'start of month');

    return Record.findAll({
      attributes: [
        'type',
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'amount'],
        [dateFn, 'date']
      ],
      group: ['type', dateFn],
      order: ['date']
    });
  }
}
