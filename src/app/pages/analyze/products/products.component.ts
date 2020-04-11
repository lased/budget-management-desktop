import { Component, OnInit } from '@angular/core';
import { Sequelize } from 'sequelize';

import { Helpers } from 'src/app/core/helpers.class';
import { TableColumn } from 'src/app/shared/components/table/table.interface';

import { Product } from 'src/app/core/models/product';

@Component({
  selector: 'app-products-analyze',
  templateUrl: './products.component.html'
})
export class ProductsAnalyzeComponent implements OnInit {
  products$: Promise<Product[]>;
  productColumns: TableColumn[];

  constructor() { }

  ngOnInit() {
    this.productColumns = [
      { field: 'name', header: 'Наименование' },
      { field: 'quantity', header: 'Количество', format: val => Helpers.formatNumber(val) },
      { field: 'price', header: 'Цена', format: val => Helpers.formatCurrency(val / 100) },
      { field: 'dataValues.amount', header: 'Сумма', format: val => Helpers.formatCurrency(val / 100) }

    ];
    this.products$ = this.getTopProducts();
  }

  getTopProducts(limit: number = 10) {
    const sumQuantity = Sequelize.fn('SUM', Sequelize.col('quantity'));

    return Product.findAll({
      attributes: [
        'name',
        'price',
        [sumQuantity, 'quantity'],
        [Sequelize.literal('quantity * price'), 'amount']
      ],
      group: ['name'],
      order: [Sequelize.literal('quantity * price DESC')]
    });
  }
}
