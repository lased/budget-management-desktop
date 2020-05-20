import { Component, OnInit } from '@angular/core';
import { WhereOptions, Sequelize } from 'sequelize';

import { AppChart } from '@core/interfaces';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { InputComponentOptions } from '@shared/components/input/input.interface';
import { Category } from '@core/models/category';
import { Record } from '@core/models/record';
import { Helpers } from '@core/helpers.class';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html'
})
export class PlanningCategoriesComponent implements OnInit {
  loading = true;
  selected = false;
  categoryChart: AppChart;
  form: FormGroup;
  inputs: InputComponentOptions[];

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.categoryChart = this.getCategoryChart();
    this.form = this.fb.group({
      category: [''],
      subcategory: [''],
    });
    this.form.disable();
    this.inputs = [
      {
        type: 'select', placeholder: 'Категория', control: this.form.controls.category as FormControl,
        optionLabel: 'name', selected: this.selectedCategory.bind(this)
      },
      {
        type: 'select', placeholder: 'Подкатегория', control: this.form.controls.subcategory as FormControl,
        optionLabel: 'name', selected: this.selectedCategory.bind(this)
      }
    ];
    this.getCategories().then(cats => {
      this.inputs[0].options = cats;
      this.form.controls.category.enable();
    });
  }

  getCategoryChart(): AppChart {
    return {
      chart: {
        type: 'bar',
        height: 300
      },
      xaxis: { labels: { formatter: d => Helpers.formatDate(d, 'LLLL y') } },
      yaxis: { labels: { formatter: val => Helpers.formatCurrency(val || 0) }, show: false },
      tooltip: {
        y: { formatter: val => Helpers.formatCurrency(val) }
      },
      plotOptions: {
        bar: {
          dataLabels: {
            position: 'top'
          }
        }
      },
      dataLabels: {
        enabled: true,
        formatter: val => Helpers.formatCurrency(val),
        offsetY: -20,
        style: {
          fontSize: '12px',
          colors: ['#304758']
        }
      },
    };
  }

  getCategories(parentId = null) {
    return Category.findAll({ where: { parentId } }) as Promise<Category[]>;
  }

  selectedCategory(category: Category) {
    this.selected = true;
    this.loading = true;

    if (category.parentId === null) {
      this.getCategories(category.id).then(cats => {
        this.inputs[1].options = cats;

        if (cats.length) {
          this.form.controls.subcategory.enable();
        } else {
          this.form.controls.subcategory.disable();
        }
      });
    }

    this.getCategoriesSeries(category);
  }

  getCategoriesSeries(category: Category) {
    const where: WhereOptions = {};
    const dateFn = Sequelize.fn('datetime', Sequelize.col('date'), 'start of month');

    if (category.parentId !== null) {
      where.subcategoryId = category.id;
    } else {
      where.categoryId = category.id;
    }

    return Record.findAll({
      where,
      attributes: [
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'amount'],
        [dateFn, 'date']
      ],
      group: [dateFn],
      order: [['date', 'DESC']],
      limit: 6
    }).then(recs => {
      if (recs.length) {
        recs = recs.reverse();
        this.categoryChart.labels = recs.map(r => r.date);
        this.categoryChart.series = [
          {
            name: 'Расход',
            data: recs.map(r => r.amount)
          }
        ];
      } else {
        this.selected = false;
      }

      this.loading = false;
    });
  }
}
