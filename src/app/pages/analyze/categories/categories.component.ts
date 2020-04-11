import { Component, OnInit } from '@angular/core';
import { Sequelize, Op } from 'sequelize';
import * as Chart from 'chart.js';

import { Helpers } from 'src/app/core/helpers.class';
import { RecordType } from 'src/app/core/interfaces';
import { TableColumn } from 'src/app/shared/components/table/table.interface';

import { Record } from 'src/app/core/models/record';
import { Category } from 'src/app/core/models/category';
import { User } from 'src/app/core/models/user';

@Component({
  selector: 'app-categories-analyze',
  templateUrl: './categories.component.html'
})
export class CategoriesAnalyzeComponent implements OnInit {
  doughnutIncomeChart$: Promise<any>;
  doughnutExpenseChart$: Promise<any>;
  records$: Promise<Record[]>;

  recordColumns: TableColumn[];

  constructor() { }

  ngOnInit() {
    this.doughnutIncomeChart$ = this.getDoughnutChart(RecordType.income);
    this.doughnutExpenseChart$ = this.getDoughnutChart();
    this.recordColumns = [
      { field: 'user.name', header: 'Пользователь' },
      { field: 'date', header: 'Дата', format: date => Helpers.formatDate(date) },
      { field: 'amount', header: 'Сумма', format: amount => Helpers.formatCurrency(amount) },
      { field: 'note', header: 'Примечание' }
    ];
    this.records$ = Promise.resolve([]);
  }

  async getDoughnutChart(type: RecordType = RecordType.expense): Promise<any> {
    const self = this;
    const colors = [];
    const selectCategory = this.selectCategory;
    const [categories, subcategories] = await Promise.all([
      this.getSumGroupCategory(type),
      this.getSumGroupCategory(type, true)
    ]);
    const getData = (r: Record) => r.amount;

    for (let index = 0; index < categories.length + subcategories.length; index++) {
      colors.push(Helpers.getRandomColor());
    }

    return {
      data: {
        labels: [
          ...categories.map(r => r.category.name),
          ...subcategories.map(r => r.subcategory.name)
        ],
        datasets: [
          {
            data: [...categories.map(getData), ...new Array(subcategories.length).fill(0)],
            backgroundColor: colors
          },
          {
            data: [...new Array(categories.length).fill(0), ...subcategories.map(getData)],
            backgroundColor: colors
          }
        ]
      },
      options: {
        circumference: Math.PI,
        rotation: -Math.PI,
        legend: {
          position: 'left'
        },
        tooltips: {
          callbacks: {
            label: (tooltipItem, data) => {
              const value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
              const label = data.labels[tooltipItem.index];

              return `${label}: ${Helpers.formatCurrency(+value)}`;
            }
          }
        },
        onClick(e, activeElement) {
          const chart: Chart = this;

          if (activeElement.length) {
            const element: any = activeElement[0];
            const label = chart.data.labels[element._index] as string;

            self.records$ = selectCategory(type, label);
          }
        }
      }
    } as Chart;
  }

  async selectCategory(type: RecordType, label: string): Promise<Record[]> {
    const category: Category = await Category.findOne({ where: { name: label } });
    const records: Record[] = await Record.findAll({
      where: {
        type,
        ...(category.parentId ? { subcategoryId: category.id } : { categoryId: category.id })
      },
      include: [
        { model: User, as: 'user' }
      ],
    });

    return records;
  }

  getSumGroupCategory(type: RecordType, subcategory: boolean = false): Promise<Record[]> {
    return Record.findAll({
      attributes: [
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'amount']
      ],
      where: {
        type,
        ...(subcategory ? { subcategoryId: { [Op.not]: null } } : {})
      },
      include: [
        { model: Category, as: subcategory ? 'subcategory' : 'category' }
      ],
      group: [subcategory ? 'subcategoryId' : 'categoryId'],
    });
  }

}
