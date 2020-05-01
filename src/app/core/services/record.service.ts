import { Injectable } from '@angular/core';

import { Record } from '@core/models/record';
import { Product } from '@core/models/product';
import { Transaction } from 'sequelize/types';
import { DatabaseService } from './database.service';

@Injectable()
export class RecordService {
  private record: Record = new Record();
  private destroyProducts: Product[] = [];

  constructor(
    private db: DatabaseService
  ) { }

  getRecord() {
    return this.record;
  }

  async loadRecord(callback: () => Promise<Record>) {
    const record = await callback();

    if (record) {
      this.record = record;
    }
  }

  createProduct(product: Product) {
    const existsProduct = this.record.products?.find(p => p.name === product.name && p.price === product.price);

    if (existsProduct) {
      existsProduct.quantity += product.quantity;
      existsProduct.amount += product.amount;
    } else {
      if (!this.record.products) {
        this.record.products = [];
      }

      this.record.products.push(product);
    }
  }

  updateProduct(product: { old: Product, new: Product }) {
    this.record.products = this.record.products?.map(p => p === product.old ? product.new : p);
  }

  deleteProduct(product: Product) {
    if (product.id) {
      this.destroyProducts.push(product);
    }

    this.record.products = this.record.products?.filter(p => p !== product);
  }

  async save() {
    let transaction: Transaction;
    let result: Record;

    try {
      transaction = await this.db.connection.transaction();
      result = await this.record.save();

      if (this.record.products?.length) {
        const arrSaves = this.record.products.map(p => {
          p.recordId = result.id;

          return p.save();
        });

        await Promise.all(arrSaves);
      }
      await Promise.all(this.destroyProducts.map(p => p.destroy()));
      await transaction.commit();
    } catch (err) {
      if (err) {
        await transaction.rollback();
        throw err;
      }
    }
  }
}
