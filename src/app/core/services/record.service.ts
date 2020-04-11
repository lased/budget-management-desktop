import { Injectable } from '@angular/core';

import { Record } from '@core/models/record';
import { Product } from '@core/models/product';
import { Transaction } from 'sequelize/types';
import { DatabaseService } from './database.service';

@Injectable()
export class RecordService {
  private record: Record = new Record();

  constructor(
    private db: DatabaseService
  ) { }

  getRecord() {
    this.checkProducts();

    return this.record;
  }

  async loadRecord(callback: () => Promise<Record>) {
    const record = await callback();

    if (record) {
      this.record = record;
      this.checkProducts();
    }
  }

  createProduct(product: Product) {
    this.checkProducts();
    this.record.products.push(product);
  }

  updateProduct(product: { old: Product, new: Product }) {
    this.checkProducts();
    this.record.products = this.record.products.map(p => p.name === product.old.name ? product.new : p);
  }

  deleteProduct(product: Product) {
    this.checkProducts();
    this.record.products = this.record.products.filter(p => p.name !== product.name);
  }

  async save() {
    let transaction: Transaction;
    let result: Record;

    try {
      transaction = await this.db.connection.transaction();
      result = await this.record.save();

      if (this.record.products.length) {
        const arrSaves = this.record.products.map(p => {
          p.recordId = result.id;

          return p.save();
        });

        await Promise.all(arrSaves);
      }
      await transaction.commit();
    } catch (err) {
      if (err) {
        await transaction.rollback();
        throw err;
      }
    }
  }

  private checkProducts() {
    if (!this.record.products) {
      this.record.products = [];
    }
  }
}
