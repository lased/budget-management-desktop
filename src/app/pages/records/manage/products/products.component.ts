import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { DialogService } from 'primeng/api';

import { TableColumn, TableActions } from '@shared/components/table/table.interface';
import { Helpers } from '@core/helpers.class';
import { Product } from '@core/models/product';
import { ProductManageComponent } from './manage/manage.component';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html'
})
export class ProductsComponent implements OnInit {
  @Input() list: Product[] = [];
  @Output() deleteEvent = new EventEmitter();
  @Output() updateEvent = new EventEmitter();
  @Output() createEvent = new EventEmitter();

  listColumns: TableColumn[];
  actionsCallback: TableActions;

  helpers = Helpers;

  constructor(
    private dialog: DialogService
  ) { }

  ngOnInit() {
    this.actionsCallback = {
      onCreate: () => this.create(),
      onUpdate: (product: Product) => this.update(product),
      onDelete: (product: Product) => this.delete(product)
    };
    this.listColumns = [
      { field: 'name', header: 'Наименование' },
      { field: 'quantity', header: 'Количество', format: quantity => this.helpers.formatNumber(quantity) },
      { field: 'price', header: 'Цена', format: price => this.helpers.formatCurrency(price) },
      { field: 'price', header: 'Сумма', format: (price, _, row) => this.helpers.formatCurrency(price * row.quantity) }
    ];
  }

  openDialog(header: string, data: object = {}) {
    return this.dialog.open(ProductManageComponent, {
      width: '50%',
      header,
      data
    });
  }

  create() {
    const header = 'Добавление товара или услуги';

    this.openDialog(header).onClose.subscribe((newProduct: Product) => {
      if (newProduct) {
        this.createEvent.emit(newProduct);
      }
    });
  }

  update(product: Product) {
    const header = 'Редактировать товар или услугу';
    const data = { product };

    this.openDialog(header, data).onClose.subscribe((updatedProduct: Product) => {
      if (updatedProduct) {
        this.updateEvent.emit({
          old: product,
          new: updatedProduct
        });
      }
    });
  }

  delete(product: Product) {
    this.deleteEvent.emit(product);
  }
}
