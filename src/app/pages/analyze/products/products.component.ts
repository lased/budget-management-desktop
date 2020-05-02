import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';

import { Helpers } from '@core/helpers.class';
import { TableColumn } from '@shared/components/table/table.interface';

import { Product } from '@core/models/product';
import { User } from '@core/models/user';
import { Category } from '@core/models/category';
import { Record } from '@core/models/record';
import { RecordType } from '@core/interfaces';

import { AppIncludeModel } from '../shared/charts/table/table.component';

@Component({
  selector: 'app-products-analyze',
  templateUrl: './products.component.html'
})
export class ProductsAnalyzeComponent implements OnInit {
  productColumns: TableColumn[];
  include: AppIncludeModel[];
  charts: MenuItem[];

  constructor() { }

  ngOnInit() {
    this.charts = [
      { label: 'Категории расходов', icon: '', routerLink: ['categories', RecordType.expense] },
      { label: 'Пользователи', icon: '', routerLink: ['users'] }
    ];
    this.include = [
      { model: Category, as: 'category' },
      { model: Category, as: 'subcategory' },
      { model: User, as: 'user' },
      { model: Product, as: 'products' }
    ];
    this.productColumns = [
      { field: 'products.name', header: 'Наименование' },
      { field: 'category.name', header: 'Категория' },
      { field: 'subcategory.name', header: 'Подкатегория' },
      { field: 'user.name', header: 'Пользователь' },
      { field: 'products.quantity', header: 'Количество', format: val => Helpers.formatNumber(val) },
      { field: 'products.price', header: 'Цена', format: val => Helpers.formatCurrency(val) },
      { field: 'products.amount', header: 'Сумма', format: val => Helpers.formatCurrency(val) }
    ];
  }

  formatedOutput({ count, rows: records }) {
    const products = [];

    records.forEach((r: Record) => {
      products.push(...r.products.map(p => ({
        products: p,
        category: r.category,
        subcategory: r.subcategory,
        user: r.user,
      })));
    });

    return { count, rows: products };
  }
}
