import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ApexAxisChartSeries } from 'ng-apexcharts';

import { AppChart } from '@core/interfaces';
import { Helpers } from '@core/helpers.class';
import { Record } from '@core/models/record';
import { AnalyzeService } from '@core/services/analyze.service';
import { MovingAverage, NeuralModel } from './algorithm.class';

interface ForecastPeriod {
    name: string;
    value: number;
}

type ForecastMethods = 'movingAverage' | 'neuralModel';

@Component({
    selector: 'app-forecast-analyze',
    templateUrl: './forecast.component.html'
})
export class ForecastAnalyzeComponent implements OnInit {
    loading = true;
    forecastChart: AppChart = {};

    form: FormGroup;
    expenses: Record[];
    periods: ForecastPeriod[];
    lastPeriod: ForecastPeriod;

    constructor(
        private fb: FormBuilder,
        private analyzeService: AnalyzeService
    ) { }

    ngOnInit() {
        this.form = this.fb.group({
            period: [''],
            methods: [['movingAverage'] as ForecastMethods[]]
        });
        this.form.disable();
        this.forecastChart = this.getForecastChart();
        this.periods = [
            { name: '1 месяц', value: 1 },
            { name: '3 месяца', value: 3 },
            { name: 'Пол года', value: 6 }
        ];
        this.analyzeService.getMonthlyExpenses().then(recs => {
            this.forecastChart.labels = recs.map(r => r.date.toISOString());
            this.forecastChart.series[0] = {
                name: 'Расход',
                data: recs.map(r => r.amount)
            };
            this.loading = false;

            if (recs.length > 3) {
                this.form.enable();
            }
        });
    }

    getForecastChart(): AppChart {
        return {
            series: [],
            xaxis: { type: 'datetime' },
            yaxis: { labels: { formatter: val => Helpers.formatCurrency(val) } },
            chart: {
                type: 'area', animations: { enabled: false }, toolbar: { show: true }
            },
            legend: { position: 'top' },
            colors: ['#e74c3c', '#f1c40f', '#3498db'],
            markers: { size: 5 },
            title: { text: 'Прогнозирование расходов', align: 'center' },
            dataLabels: { enabled: false },
            tooltip: {
                x: { format: 'dd.MM.yyyy' },
                y: { formatter: val => Helpers.formatCurrency(val) }
            }
        };
    }

    selectedPeriod({ value: period }) {
        this.loading = true;

        const formMethods = this.form.controls.methods.value as ForecastMethods[];
        const series = this.forecastChart.series as ApexAxisChartSeries;
        const expenses = series[0].data as number[];
        const addSeries = [];
        const methods = {
            movingAverage: formMethods.includes('movingAverage'),
            neuralModel: formMethods.includes('neuralModel')
        };

        if (this.lastPeriod) {
            expenses.splice(expenses.length - this.lastPeriod.value, this.lastPeriod.value);
            this.forecastChart.labels = this.forecastChart.labels.slice(0, -this.lastPeriod.value);
            series.splice(1);
            this.lastPeriod = null;
        }

        if (methods.movingAverage || methods.neuralModel) {
            if (methods.movingAverage) {
                const MA = new MovingAverage(expenses);
                const MAValues = MA.forecast(period.value);
                const averages = MA.averageArray();

                addSeries.push({
                    name: 'Прогноз (скользящая средняя)',
                    data: [...averages, ...MAValues]
                });
            }
            if (methods.neuralModel) {
                const net = new NeuralModel(expenses);
                const netValues = net.forecast(period.value);

                addSeries.push({
                    name: 'Прогноз (нейронная сеть)',
                    data: [...net.getModelData(), ...netValues]
                });
            }

            for (let index = 0; index < period.value; index++) {
                const lastMonth = this.forecastChart.labels[this.forecastChart.labels.length - 1];
                const newMonth = new Date(lastMonth);

                expenses.push(null);
                newMonth.setMonth(newMonth.getMonth() + 1);
                this.forecastChart.labels = [...this.forecastChart.labels, newMonth.toISOString()];
            }

            this.lastPeriod = period;
            this.forecastChart.series = [
                ...series, ...addSeries
            ] as ApexAxisChartSeries;
        }

        this.loading = false;
    }
}
